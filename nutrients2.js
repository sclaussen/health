'use strict'
// process.env.DEBUG = 'health';
const d = require('debug')('health');
const p = require('./lib/pr').p(d);
const p4 = require('./lib/pr').p4(d);

const _ = require('lodash')
const curl = require('./lib/curl');
const table = require('./lib/table').table;

var ingredients = [
    // lettuce red leaf
    // Siggis, Yogurt Plain Whole Milk
    // Nature’s Rancher, No Sugar Added Hickory Smoked Bacon, 12 ozNature’s Rancher, No Sugar Added Hickory Smoked Baco
    'https://www.wholefoodsmarket.com/product/365-by-whole-foods-market-organic-coconut-oil-expeller-expressed-14-fl-oz-b074h5bv9y',
    'https://www.wholefoodsmarket.com/product/365-by-whole-foods-market-extra-virgin-olive-oil-cold-processed-mediterranean-blend-1014-fl-oz-b074y6wz8x',
    'https://www.wholefoodsmarket.com/product/produce-serrano-pepper-b0787w921k',
    'https://www.wholefoodsmarket.com/product/vital-farms-organic-large-eggs-36-oz-b089c8jt7b',
    'https://www.wholefoodsmarket.com/product/vital-farms-pastureraised-alfresco-eggs-24-oz-b0849mz45y',
    'https://www.wholefoodsmarket.com/product/365-by-whole-foods-market-organic-broccoli-florets-16-oz-b0812lws2s',
    'https://www.wholefoodsmarket.com/product/365-by-whole-foods-market-frozen-vegetables-broccoli-florets-b074h5b5h7',
    'https://www.wholefoodsmarket.com/product/365-by-whole-foods-market-organic-cauliflower-florets-16-oz-b0812kzpj4',
    'https://www.wholefoodsmarket.com/product/365-by-whole-foods-market-produce-organic-packaged-baby-arugula-b07pff27d1',
    'https://www.wholefoodsmarket.com/product/365-by-whole-foods-market-produce-organic-packaged-baby-spinach-b082fjnkjv',
    'https://www.wholefoodsmarket.com/product/produce-organic-romaine-lettuce-b07812n26q',
    'https://www.wholefoodsmarket.com/product/produce-organic-collard-green-b0785vryvh',
    'https://www.wholefoodsmarket.com/product/produce-organic-white-mushroom-b07814mfc7',
    'https://www.wholefoodsmarket.com/product/produce-organic-red-radish-bunch-b09qqlf423',
    'https://www.wholefoodsmarket.com/product/calavo-bagged-hass-avocados-b07fxsz49r',
    'https://www.wholefoodsmarket.com/product/organicville-organic-stone-ground-mustard-12-oz-b00mfnax52',
    'https://www.wholefoodsmarket.com/product/wild-planet-wild-sardines-in-extra-virgin-olive-oil-b00xmzo3qm',
    'https://www.wholefoodsmarket.com/product/wild-planet-skinless-boneless-wild-sardine-fillets-in-olive-oil-425-oz-b07w7vcj1v',
    'https://www.wholefoodsmarket.com/product/wild-planet-wild-mackerel-fillets-b076vw85s5',
    'https://www.wholefoodsmarket.com/product/wild-planet-wild-albacore-tuna-5-oz-b00cq7puim',
    'https://www.wholefoodsmarket.com/product/365-by-whole-foods-market-organic-mozzarella-string-cheese-24pk-1-each-b074h6r58h',
    'https://www.wholefoodsmarket.com/product/365-by-wfm-avocado-oil-254-fl-oz-b08sxszjwf',
    'https://www.wholefoodsmarket.com/product/kerrygold-grassfed-dubliner-irish-cheese-7oz-b001e96kuu',
    'https://www.wholefoodsmarket.com/product/bhu-foods-keto-chocolate-chip-cookie-dough-bites-529-oz-b07tt8fd4f',
    'https://www.wholefoodsmarket.com/product/bhu-foods-keto-double-dark-chocolate-chip-cookie-dough-bites-529-oz-b07tt8fkvx',
    'https://www.wholefoodsmarket.com/product/bhu-foods-peanut-butter-cookie-dough-bites-529-oz-b08dx5md5l',
    'https://www.wholefoodsmarket.com/product/bhu-foods-white-chocolate-macadamia-cookie-dough-bite-088-oz-b087xq5f64',
    'https://www.wholefoodsmarket.com/product/whole-foods-market-premium-whole-macadamia-nuts-8-oz-b002hqnkvq',
    'https://www.wholefoodsmarket.com/product/babybel-mini-original-semisoft-cheese-6pk-45-ounce-b000qg54yu',
    'https://www.wholefoodsmarket.com/product/365-everyday-value-organic-pumpkin-seeds-8-ounce-b07gl6jlzy',
    'https://www.wholefoodsmarket.com/product/365-everyday-value-shredded-monterey-jack-cheddar-8-oz-b07vm4mzs6',
    'https://www.wholefoodsmarket.com/product/produce-banana-b07fyykkqk',
    'https://www.wholefoodsmarket.com/product/365-by-whole-foods-market-peanuts-dry-roasted-unsalted-16-oz-b07qmw5y77',
    'https://www.wholefoodsmarket.com/product/produce-navel-orange-b000se9nug',
    'https://www.wholefoodsmarket.com/product/produce-organic-kiwi-b077zxhwhh',
    'https://www.wholefoodsmarket.com/product/produce-organic-fuji-apple-b000ytxxdi',
    'https://www.wholefoodsmarket.com/product/produce-organic-carrots-b07813yjl1',
    'https://www.wholefoodsmarket.com/product/produce-organic-red-bell-pepper-b000rgyjqi',
    'https://www.wholefoodsmarket.com/product/produce-organic-green-bell-pepper-b000p6j14k',
    'https://www.wholefoodsmarket.com/product/produce-organic-white-onion-b0787z3t3b',
    'https://www.wholefoodsmarket.com/product/365-by-whole-foods-market-organic-stone-ground-corn-tortilla-8-oz-b084r4r9pk',
    'https://www.wholefoodsmarket.com/product/organic-valley-organic-whole-milk-grassmilk-b06xwl6tfw',
    'https://www.wholefoodsmarket.com/product/365-by-whole-foods-market-organic-california-raisins-sundried-12-oz-b07qg4mn46',
    'https://www.wholefoodsmarket.com/product/doctor-in-the-kitchen-organic-rosemary-flackers-5-oz-b0078dq85s',
    'https://www.wholefoodsmarket.com/product/365-everyday-value-organic-black-pepper-cracked-turkey-breast-b074h5y183',
    'https://www.wholefoodsmarket.com/product/produce-organic-green-cabbage-b0787tk5fv',
    'https://www.wholefoodsmarket.com/product/food-for-life-ezekiel-49-original-bread-24-oz-b000rey4mo',
    'https://www.wholefoodsmarket.com/product/crofters-organic-strawberry-premium-fruit-spread-165-oz-b004si9nhq',
    'https://www.wholefoodsmarket.com/product/365-by-whole-foods-market-swiss-cheese-slices-8-oz-b07nrcgwys',
]

var macroNutrientSearchCriterias = [
    {
        name: 'Calories',
        units: [ 'kcal' ]
    },
    {
        name: 'Total Fat',
        units: [ 'g' ]
    },
    {
        name: 'Saturated Fat',
        units: [ 'g' ]
    },
    {
        name: 'Trans Fat',
        units: [ 'g' ]
    },
    {
        name: 'Polyunsaturated Fat',
        units: [ 'g' ]
    },
    {
        name: 'Monounsaturated Fat',
        units: [ 'g' ]
    },
    {
        name: 'Cholesterol',
        units: [ 'mg' ]
    },
    {
        name: 'Sodium',
        units: [ 'mg' ]
    },
    {
        name: 'Carbohydrates',
        units: [ 'g' ]
    },
    {
        name: 'Fiber',
        units: [ 'g' ]
    },
    {
        name: 'Sugars',
        units: [ 'g' ]
    },
    {
        name: 'Includes Added Sugars',
        units: [ 'g' ]
    },
    {
        name: 'Sugar Alcohol',
        units: [ 'g' ]
    },
    {
        name: 'Protein',
        units: [ 'g' ]
    },
]

var microNutrientSearchCriterias = [
    {
        name: 'Zinc',
        units: [ 'mg' ]
    },
    {
        name: 'Vitamin K',
        units: [ 'µg', 'mcg' ]
    },
    {
        name: 'Vitamin E',
        units: [ 'mg', 'IU' ],
        conversion_factor: 1.5,
    },
    {
        name: 'Vitamin D',
        units: [ 'mcg', 'IU' ],
        conversion_factor: 40,
    },
    {
        name: 'Vitamin C',
        units: [ 'mg' ]
    },
    {
        name: 'Vitamin B6',
        units: [ 'mg' ]
    },
    {
        name: 'Vitamin B12',
        units: [ 'µg', 'mcg' ]
    },
    {
        name: 'Vitamin A',
        units: [ 'mcg', 'IU' ],
        conversion_factor: 3.336,
    },
    {
        name: 'Thiamin',
        units: [ 'mg' ]
    },
    {
        name: 'Selenium',
        units: [ 'µg', 'mcg' ]
    },
    {
        name: 'Riboflavin',
        units: [ 'mg' ]
    },
    {
        name: 'Potassium',
        units: [ 'mg' ]
    },
    {
        name: 'Phosphorus',
        units: [ 'mg' ]
    },
    {
        name: 'Pantothenic Acid',
        units: [ 'mg' ]
    },
    {
        name: 'Niacin',
        units: [ 'mg' ]
    },
    {
        name: 'Manganese',
        units: [ 'mg' ]
    },
    {
        name: 'Magnesium',
        units: [ 'mg' ]
    },
    {
        name: 'Iron',
        units: [ 'mg' ]
    },
    {
        name: 'Folic Acid',
        units: [ 'µg', 'mcg' ]
    },
    {
        name: 'Folate',
        units: [ 'µg', 'mcg' ]
    },
    {
        name: 'Copper',
        units: [ 'mg' ]
    },
    {
        name: 'Calcium',
        units: [ 'mg' ]
    },
]

main();

async function main() {
    for (let ingredientUrl of ingredients) {

        let body = (await curl.get(ingredientUrl)).body
        body = body.replace(/<[^<]+>/g, "");
        body = body.replace(/\n/g, "");
        body = body.replace(/\n/g, "");
        body = body.replace(/\\/g, "");
        // body = body.replace(/\"/g, "'");
        body = body.replace(/.+{"props":/g, "{\"props\":");
        body = body.replace(/"globalAlert.*$/, "")
        body = body.replace(/,$/, "}}}")
        // body = body.replace(/'/g, '"')

        let o = JSON.parse(body)
        p4(o)

        console.log(o.props.pageProps.data.name + '\n')
        console.log(o.props.pageProps.data.ingredients)

        let macroNutrientData = []
        macroNutrientData.push({ name: "Serving Size", value: o.props.pageProps.data.servingInfo.secondaryServingSize, unit: o.props.pageProps.data.servingInfo.secondaryServingSizeUom })

        for (let macroNutrientSearchCriteria of macroNutrientSearchCriterias) {
            addNutrient(macroNutrientSearchCriteria, o.props.pageProps.data.nutritionElements, macroNutrientData)
        }

        let microNutrientData = []
        for (let microNutrientSearchCriteria of microNutrientSearchCriterias) {
            addNutrient(microNutrientSearchCriteria, o.props.pageProps.data.nutritionElements, microNutrientData)
        }

        console.log(print(macroNutrientData))
        console.log(print(microNutrientData))
    }
}

function addNutrient(nutrientSearchCriteria, nutrients, data) {
    let nutrient = _.find(nutrients, { name: nutrientSearchCriteria.name })
    if (nutrient) {
        let unit = nutrient.uom
        if (!unit) {
            unit = nutrientSearchCriteria.units[0]
        }
        data.push({ name: nutrient.name, value: nutrient.perServing, unit: unit })
        return
    }

    data.push({ name: nutrientSearchCriteria.name, value: 0, unit: nutrientSearchCriteria.units[0] })
}

function print(data) {
    return table(data, [
        {
            name: 'name',
            alias: 'Name',
            width: -21
        },
        {
            name: 'value',
            alias: '#',
            width: 11,
        },
        {
            name: 'unit',
            alias: 'Unit',
            width: -5,
        },
    ])
}
