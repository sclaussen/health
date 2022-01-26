'use strict';
// process.env.DEBUG = 'health';
const d = require('debug')('health');

const fs = require('fs');
const _ = require('lodash');

const YAML = require('yaml');
var program = require('commander');
var moment = require('moment');

const table = require('./lib/table').table;
const round = require('./lib/table').round;
const slack = require('./lib/slack').slack;

const p = require('./lib/pr').p(d);
const p4 = require('./lib/pr').p4(d);
const y4 = require('./lib/pr').y4(d);
const e = require('./lib/pr').e(d);



var healthDefinition;
var profile;
var ingredientsDb;
var meal;
var macros;



health(process.argv);



async function health(args) {

    let options = parse(args);
    healthDefinition = YAML.parse(fs.readFileSync('./dat/health.yaml', 'utf8'), { prettyErrors: true });
    profile = getProfile(options);
    if (options.profile) {
        console.log(printProfile(profile));
        process.exit(0);
    }


    ingredientsDb = getIngredients(options);
    meal = getMeal(options);

    let recipes = healthDefinition.recipes;
    macros = getMacros(meal);
    while (addMealIngredients(meal, recipes)) {
    }

    macros = getMacros(meal);
    meal = _.filter(meal, function(ingredient) {
        if (ingredient.amount > 0) return true;
    });
    console.log();
    console.log(print(macros, options));
    console.log();
    console.log(print(meal, options));
    if (options.slack) {
        slack('```' + printSummary(meal, options) + '```');
    }
}


// Read the profile.yaml definition and then calculate a bunch of
// derived values from that data, the most important of which are the
// macro goals for the day for fat and protein.
//
// Some of the profile values can be overridden via command line
// options (eg weight, body fat, and burned calories).
//
// Write the resulting profile values, both original, overridden, and
// derived, back to the profile definition.
function getProfile(options) {
    profile = healthDefinition.profile;

    // Calculate the age given the birthdate
    profile.age = round((moment().diff(moment(profile.birthdate), 'months')) / 12, 1);

    // Derive some basic conversion values useful for follow-on formulas
    profile.weight_kg = round(profile.weight * 0.453592, 1);
    profile.height_cm = round(profile.height * 2.54, 1);

    // Allow the command line values to take precedent over the profile data
    profile.weight = options.weight || profile.weight;
    profile.body_fat_pct = round(options.body_fat_pct || profile.body_fat_pct, 1);
    profile.calories_burned = options.calories_burned || profile.calories_burned;

    // Derive the BMI
    profile.body_mass_index = round((profile.weight / (profile.height * profile.height)) * 703, 1);

    // Determine the fat mass and lean body mass given the body fat percentage
    profile.fat_mass = round(profile.weight * (profile.body_fat_pct / 100), 1);
    profile.lean_body_mass = round(profile.weight - profile.fat_mass, 1);

    // Derive the base metabolic rate (male/female dependent)
    if (profile.sex === 'male') {
        profile.calories_base_metabolic_rate = round((9.99 * profile.weight_kg) + (6.25 * profile.height_cm) - (4.92 * profile.age + 5));
    } else {
        profile.calories_base_metabolic_rate = round((9.99 * profile.weight_kg) + (6.25 * profile.height_cm) - (4.92 * profile.age - 161));
    }

    // Derive the resting calories which are the BMR * 1.2
    profile.calories_resting = round(profile.calories_base_metabolic_rate * 1.2);

    // Derive the total daily calories by adding the number of
    // additional calories burned.
    //
    // Based on this total daily calorie goal, derive the amount of
    // fat, fiber, netcarbs, protein, and water required.
    profile.calories_goal_unadjusted = round(profile.calories_resting + profile.calories_burned);
    profile.protein_goal_unadjusted = round(profile.lean_body_mass * profile.activity_ratio);
    profile.fiber_goal_unadjusted = round((profile.calories_goal_unadjusted / 1000) * 14);
    profile.fat_goal_unadjusted = round((profile.calories_goal_unadjusted - ((profile.protein_goal_unadjusted + profile.netcarbs_goal_unadjusted) * 4)) / 9);
    profile.fat_goal_percentage_unadjusted = round(((profile.fat_goal_unadjusted * 9) / profile.calories_goal_unadjusted) * 100);
    profile.netcarb_goal_percentage_unadjusted = round(((profile.netcarbs_goal_unadjusted * 4) / profile.calories_goal_unadjusted) * 100);
    profile.protein_goal_percentage_unadjusted = round(((profile.protein_goal_unadjusted * 4) / profile.calories_goal_unadjusted) * 100);

    // Adjust the daily calorie goal based on the deficit percentage,
    // and then derive the daily macro goal for fat, fiber, netcarbs,
    // and protein.
    profile.calories_goal = round(profile.calories_goal_unadjusted - (profile.calories_goal_unadjusted * (profile.deficit_pct / 100)));
    profile.protein_goal = round(profile.lean_body_mass * profile.activity_ratio);
    profile.fiber_goal = round((profile.calories_goal / 1000) * 14);
    profile.netcarbs_goal = profile.netcarbs_goal_unadjusted;
    profile.fat_goal = round((profile.calories_goal - ((profile.protein_goal + profile.netcarbs_goal) * 4)) / 9);
    profile.fat_goal_percentage = round(((profile.fat_goal * 9) / profile.calories_goal) * 100);
    profile.netcarb_goal_percentage = round(((profile.netcarbs_goal * 4) / profile.calories_goal) * 100);
    profile.protein_goal_percentage = round(((profile.protein_goal * 4) / profile.calories_goal) * 100);
    profile.water_liters = round((profile.weight / 2) * .029574, 1)

    fs.writeFileSync('./dat/health.yaml', YAML.stringify(healthDefinition, null, 4), 'utf8')

    return profile;
}


function printProfile(profile) {
    let remove = [ 'sex', 'height', 'birthdate', 'fat_tolerance', 'protein_tolerance', 'weight_kg', 'height_cm', 'fat_goal_percentage_unadjusted', 'netcarb_goal_percentage_unadjusted', 'protein_goal_percentage_unadjusted', 'fat_goal_percentage', 'netcarb_goal_percentage', 'protein_goal_percentage', 'fat_goal_unadjusted', 'fiber_goal_unadjusted', 'netcarbs_goal_unadjusted', 'protein_goal_unadjusted' ];
    let data = [];

    for (let key of _.keys(profile)) {
        if (_.includes(remove, key)) {
            continue;
        }
        let value = profile[key];
        data.push({ name: key, value: value });
    }
    data.push({
        name: 'macros_unadjusted',
        value: profile['fat_goal_percentage_unadjusted'] + '/' + profile['netcarb_goal_percentage_unadjusted'] + '/' + profile['protein_goal_percentage_unadjusted']
    });
    data.push({
        name: 'macros',
        value: profile['fat_goal_percentage'] + '/' + profile['netcarb_goal_percentage'] + '/' + profile['protein_goal_percentage']
    });
    p4(data);

    return table(data, [
        {
            name: 'name',
            alias: 'profile attribute',
            width: -40
        },
        {
            name: 'value',
            alias: '#',
            width: 11,
        },
    ]);
}


// This simple retrieves the full list of ingredients and defaults the
// macros to 0 if they weren't specified in the definition.
function getIngredients(options) {
    let ingredientsDb = healthDefinition.ingredients;
    for (let ingredient of ingredientsDb) {
        ingredient.fat = ingredient.fat || 0;
        ingredient.fiber = ingredient.fiber || 0;
        ingredient.netcarbs = ingredient.netcarbs || 0;
        ingredient.protein = ingredient.protein || 0;
    }
    return ingredientsDb;
}


function getMeal(options) {
    let mealDefinition = healthDefinition.meal;

    let meal = [];
    for (let ingredientName of _.keys(mealDefinition)) {
        updateIngredient(meal, ingredientName, mealDefinition[ingredientName]);
    }

    if (options.protein) {
        updateIngredient(meal, options.protein, options.proteinGrams);

        if (options.protein === 'Beef') {
            updateIngredient(meal, 'Eggs', -1);
        }

        if (options.protein === 'Salmon') {
            updateIngredient(meal, 'Fish Oil', -0.5);
        }
    }

    return meal;
}


function getMacros(meal) {

    let macroGoalsUnadjusted = {
        name: 'goals_unadjusted',
        totalCalories: profile.calories_goal_unadjusted,
        totalFat: profile.fat_goal_unadjusted,
        totalFiber: profile.fiber_goal_unadjusted,
        totalNetcarbs: profile.netcarbs_goal_unadjusted,
        totalProtein: profile.protein_goal_unadjusted
    };

    let macroGoals = {
        name: 'goals',
        totalCalories: profile.calories_goal,
        totalFat: profile.fat_goal,
        totalFiber: profile.fiber_goal,
        totalNetcarbs: profile.netcarbs_goal,
        totalProtein: profile.protein_goal
    };

    let macroActuals = {
        name: 'actuals',
        totalCalories: 0,
        totalFat: 0,
        totalFiber: 0,
        totalNetcarbs: 0,
        totalProtein: 0
    }

    for (let ingredient of meal) {
        let servings = (ingredient.norm * ingredient.amount) / ingredient.serving_size;

        ingredient.servings = servings;
        ingredient.totalCalories = ingredient.calories * servings;
        ingredient.totalFat = ingredient.fat * servings;
        ingredient.totalFiber = ingredient.fiber * servings;
        ingredient.totalNetcarbs = ingredient.netcarbs * servings;
        ingredient.totalProtein = ingredient.protein * servings;

        macroActuals.totalCalories += ingredient.totalCalories;
        macroActuals.totalFat += ingredient.totalFat;
        macroActuals.totalFiber += ingredient.totalFiber;
        macroActuals.totalNetcarbs += ingredient.totalNetcarbs;
        macroActuals.totalProtein += ingredient.totalProtein;
    }

    macroActuals.totalCalories = round(macroActuals.totalCalories, 1);
    macroActuals.totalFat = round(macroActuals.totalFat, 1);
    macroActuals.totalFiber = round(macroActuals.totalFiber, 1);
    macroActuals.totalNetcarbs = round(macroActuals.totalNetcarbs, 1);
    macroActuals.totalProtein = round(macroActuals.totalProtein, 1);

    let macroDifference = {
        name: 'difference',
        totalCalories: round(macroActuals.totalCalories - macroGoals.totalCalories, 1),
        totalFat: round(macroActuals.totalFat - macroGoals.totalFat, 1),
        totalFiber: round(macroActuals.totalFiber - macroGoals.totalFiber, 1),
        totalNetcarbs: round(macroActuals.totalNetcarbs - macroGoals.totalNetcarbs, 1),
        totalProtein: round(macroActuals.totalProtein - macroGoals.totalProtein, 1),
    }

    return [ macroGoalsUnadjusted, macroGoals, macroActuals, macroDifference ];
}


// Returns:
// True: indicates an adjustment recipe was added to the meal successfully
// False: indicates no more adjustments can be made
function addMealIngredients(meal, recipes) {
    for (let recipe of recipes) {
        let adjustments = testRecipe(meal, recipe);
        if (adjustments) {
            for (let ingredientName of _.keys(adjustments)) {
                let ingredientAmount = adjustments[ingredientName];
                console.log('Adjusting ' + ingredientName + ' by ' + ingredientAmount);
                updateIngredient(meal, ingredientName, ingredientAmount);
            }

            return true;
        }
    }

    return false;
}


function testRecipe(meal, recipe) {
    let newMeal = _.cloneDeep(meal);

    if (recipe.type === 'randomize') {
        let shuffledIngredientNames = _.shuffle(_.keys(recipe.adjustments));
        let adjustments = {};
        for (let shuffledIngredientName of shuffledIngredientNames) {
            adjustments[shuffledIngredientName] = recipe.adjustments[shuffledIngredientName];
        }
        recipe.adjustments = adjustments;
        p('Shuffled: ' + JSON.stringify(_.keys(recipe.adjustments)));
    }

    let adjustments = {};
    for (let ingredientName of _.keys(recipe.adjustments)) {

        p('  - ' + ingredientName);
        if (getIngredient(ingredientName).out) {
            p('    - Out');
            continue;
        }

        let ingredientAmount = recipe.adjustments[ingredientName];
        if (!testIngredient(newMeal, ingredientName, ingredientAmount)) {
            return false;
        }

        adjustments[ingredientName] = ingredientAmount;

        if (_.has(recipe, 'select') && recipe.select === 1) {
            break;
        }
    }

    if (_.isEmpty(adjustments)) {
        return false;
    }

    return adjustments;
}


function testIngredient(meal, ingredientName, ingredientAmount) {
    let ingredient = updateIngredient(meal, ingredientName, ingredientAmount);
    if (ingredient.max && (ingredient.amount > ingredient.max)) {
        p('    - Maxed');
        return false;
    }

    if (ingredient.min && (ingredient.amount < ingredient.min)) {
        p('    - Minned');
        return false;
    }

    let newMacros = getMacros(meal);
    if (doMacrosExceedTolerance(newMacros)) {
        p('    - Exceeds');
        return false;
    }

    p('    - ADD');
    return true;
}


function updateIngredient(meal, name, amount) {
    let ingredient = _.find(meal, { name: name });
    if (!ingredient) {
        ingredient = getIngredient(name);
        ingredient.amount = 0;
        meal.push(ingredient);
    }

    if (_.has(ingredient, 'out') && ingredient.out === true) {
        ingredient.amount = 0;
    } else {
        ingredient.amount += amount;
    }

    return ingredient;
}


function getIngredient(name) {
    return _.cloneDeep(_.find(ingredientsDb, { name: name }))
}


function doMacrosExceedTolerance(macros) {
    let map = {
        totalFat: 'fat_tolerance',
        totalProtein: 'protein_tolerance',
    };
    for (let macro of [ 'totalFat', 'totalProtein' ]) {
        let actual = getMacro(macros, 'actuals')[macro];
        let goal = getMacro(macros, 'goals')[macro];
        if (actual > (goal + (goal * profile[map[macro]]))) {
            return true;
        }
    }

    if (getMacro(macros, 'goals')['totalNetcarbs'] > 20) {
        return true;
    }

    return false;
}


function macrosAreWithinToleranceRange(macros) {
    if (doMacrosExceedTolerance(macros)) {
        return false;
    }

    let map = {
        totalFat: 'fat_tolerance',
        totalProtein: 'protein_tolerance',
    };
    for (let macro of [ 'totalFat', 'totalProtein' ]) {
        let actual = getMacro(macros, 'actuals')[macro];
        let goal = getMacro(macros, 'goals')[macro];
        p('Minimum ' + macro + ': ' + (goal - (goal * profile[map[macro]])));
        if ((actual + (goal * profile[map[macro]])) < goal) {
            return false;
        }
    }

    return true;
}


function getMacro(macros, name) {
    let macro = _.find(macros, { name: name });
    return macro;
}


function print(meal, options) {
    return table(meal, [
        {
            name: 'name',
            width: -25
        },
        {
            name: 'amount',
            alias: '#',
            format: 'dependent',
            width: 5,
            post: 3
        },
        {
            name: 'totalCalories',
            alias: 'Cal',
            format: 'integer',
            width: 5,
            post: 3
        },
        {
            name: 'totalFat',
            alias: 'Fat',
            format: 'integer',
            width: 5,
            post: 3
        },
        {
            name: 'totalFiber',
            alias: 'Fib',
            format: 'integer',
            width: 5,
            post: 3
        },
        {
            name: 'totalNetcarbs',
            alias: 'NCb',
            format: 'integer',
            width: 5,
            post: 3
        },
        {
            name: 'totalProtein',
            alias: 'Pro',
            format: 'integer',
            width: 5,
            post: 3
        },
    ]);
}


function printSummary(meal, options) {
    return table(meal, [
        {
            name: 'name',
            width: -25
        },
        {
            name: 'amount',
            alias: '#',
            format: 'dependent',
            width: 5,
            post: 3
        },
    ]);
}


function parse(args) {
    program
        .option('-p, --profile', 'Derive and print profile information only')

        .option('-w, --weight <weight>', 'Weight (lbs)')
        .option('-f, --body-fat <body-fat>', 'Body fat percentage')
        .option('-b, --calories-burned <calories-burned>', 'Calories burned beyond BMR per day')

        .option('-C, --chicken [grams]', 'Chicken')
        .option('-S, --salmon [grams]', 'Salmon')
        .option('-B, --beef [grams]', 'Beef')
        .option('-P, --pork-chop [grams]', 'Pork chop')

        .option('-s, --slack', 'Send meal summary to slack')

        .addHelpText('after', `

To generate profile information based on health.yaml:
$ node health -p

To generate profile information based on health.yaml with overrides:
$ node health -p -w 175 -f 20 -b 500

Generate a meal plan using the defaults in health.yaml:
$ node health

Generate a meal plan using the defaults in health.yaml with 200g chicken:
$ node health -C

Generate a meal plan using the defaults in health.yaml with 250g chicken:
$ node health -C 250

Generate a meal plan using the defaults in health.yaml with 200g salmon with overrides:
$ node health -w 175 -f 20 -b 500 -C 250

Generate a meal plan using the defaults in health.yaml with 200g salmon with overrides and send to slack:
$ node health -w 175 -f 20 -b 500 -C 250 -s
`)
        .parse(args);

    let options = program.opts();

    // By default 200g of meat is assumed, but can be overridden as an
    // option
    if (options.chicken) {
        options.protein = 'Chicken';
        if (options.chicken === true) {
            options.proteinGrams = 200;
        } else {
            options.proteinGrams = options.chicken;
        }
    } else if (options.salmon) {
        options.protein = 'Salmon';
        if (options.salmon === true) {
            options.proteinGrams = 200;
        } else {
            options.proteinGrams = options.salmon;
        }
    } else if (options.beef) {
        options.protein = 'Beef';
        if (options.beef === true) {
            options.proteinGrams = 200;
        } else {
            options.proteinGrams = options.beef;
        }
    } else if (options.porkChop) {
        options.protein = 'Pork Chop';
        if (options.porkChop === true) {
            options.proteinGrams = 200;
        } else {
            options.proteinGrams = options.porkChop;
        }
    }

    if (options.caloriesBurned) {
        p4(options);
        options.calories_burned = parseInt(options.caloriesBurned);
        delete options.caloriesBurned;
    }

    if (options.bodyFat) {
        options.body_fat_pct = parseFloat(options.bodyFat);
        delete options.bodyFat;
    }

    if (options.weight) {
        options.weight = round(parseFloat(options.weight), 1)
    }

    delete options.chicken;
    delete options.salmon;
    delete options.beef;
    delete options.porkChop;

    p4(options);

    return options;
}
