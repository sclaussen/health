# Installation

1. Install Node.JS
1. `mkdir ~/src && cd ~/src` (as an example)
1. `git clone git@github.com:sclaussen/health.git` (or get the zip file and unzip it)
1. `cd ~/src/health`
1. `npm i`



# Setup

Using the -s slack option requires slack setup and the following environment variable:
- HEALTH_SLACK (enter slack channel info if using slack)



# Configuration and Usage

- In dat/health.yaml, add the following configuration values (these are all required):
  - ***sex***: male or female
  - ***height***: in inches
  - ***birthday***: YYYY-MM-DD format
  - ***weight***: in lbs
  - ***body_fat_pct***: I get this from my withings scale, other options are
    to guess, or use neck/waste measurement based formula (you can
    fine this online).
  - ***calories_burned***: I use a garmin fenix watch but you need some
    mechanism to estimate how many additional calories you burn a day
    as the result of exercise, walking, etc.
  - ***activity_ratio**
  - all the other profile configuration values are derived so ignore them for now
- Run `node health -p`

  - This will derive the remaining profile] configuration values,
    display them, as well as update them in your dat/health.yaml
    configuration file.  Here is what is dervied and how it pertains
    to meal planning:

    - ```Gross Daily Caloric Goal```: You profile data is used to
      calculate your base metabolic rate
      (```calories_base_metabolic_rate```), then that * 1.2 determines
      your resting caloric requirement (```calories_resting```), then
      I add your exercise burned calories to determine your total
      caloric requirement (```calories_goal_unadjusted```).

    - ```Net Daily Caloric Goal```: If you are trying to lose weight,
      there's an deficit percentage that lowers your daily caloric
      consumption goal defined by (```deficit_pct```).  Applying that
      value to the unadjusted caloric goal we get your adjusted
      calorie goal for the day (```calories_goal```).  This value is
      used to determine your macro goals (fat and protein), as well as
      your daily fiber and water goals.

    - ```Daily NetCarbs Goal```: This value represents the max number
      of netcarbs (carbs minus fiber) that you want to consume in a
      day.  Define it using ```netcarbs_goal```.

    - ```Protein Activity Ratio```: The ```activity_ratio``` defines
      how many grams per pound of lean body mass you need to
      maintain/grow your muscle mass.  Valid values can be found on
      the web.  This value in combination with your derived lean body
      mass are used to determine how many grams of protein you need
      (```protein_goal```).

    - ```Fat Goal```: Since your netcarbs is a constant, and your
      protein goal is a function of you activity level, the remaining
      calories you need to consume are a function of fat
      (```fat_goal```).

- To configure meals:
  - Update the dat/health.yaml meal section with your baseline meal.
  - Update the dat/health.yaml recipes section with the ordered adjustments you can make to your meal to reach your macro goals.
  - Update the dat/health.yaml ingredients section with all the ingredients you use.
    - NOTE: I need to explain the "norm" property
    - NOTE: I need to explain the "out" property
    - NOTE: I need to explain the "min" and "max" properties
- Now run `node health` to generate your meal.



# Usage

```
$ node health --help
Usage: health [options]

Options:
  -p, --profile                            Derive and print profile information only
  -w, --weight <weight>                    Weight (lbs)
  -f, --body-fat <body-fat>                Body fat percentage
  -b, --calories_burned <calories_burned>  Calories burned beyond BMR per day
  -C, --chicken [grams]                    Chicken
  -S, --salmon [grams]                     Salmon
  -B, --beef [grams]                       Beef
  -P, --pork-chop [grams]                  Pork chop
  -s, --slack                              Send meal summary to slack
  -h, --help                               display help for command


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
```



# Profile Example

The -p option uses some basic information in the dat/health.yaml
configuration file and then derives a lot of profile data from that
and then displays the most pertinent profile information.

```
$ node health -p
profile attribute                        #
weight                                 190
body_fat_pct                            25
calories_burned                        500
age                                   54.3
body_mass_index                       25.8
fat_mass                              47.5
lean_body_mass                       142.5
activity_ratio                         0.9
calories_base_metabolic_rate          1732
calories_resting                      2078
calories_goal_unadjusted              2578
deficit_pct                             25
calories_goal                         1934
fat_goal                               149
fiber_goal                              27
netcarbs_goal                           20
protein_goal                           128
water_liters                           2.8
macros_unadjusted                  77/3/20
macros                             69/4/26
```



# Meal Example

This is an example of generating a meal plan for someone who is 190
pounds, has a body fat percentage of 25%, and has burned 500 calories.
It uses a baseline meal configuration, adds 250g of chicken per the -C
cli option, and a set of meal adjustments to auto configure a meal
that meets the macro goals as defined by the profile (see
dat/health.yaml).  Some of the data values are in units (eg # of
eggs), others in tablespoons (eg Extra Virgin Olive Oil), and the
remaining are in grams.

```
$ node health -w 190 -f 25 -b 500 -C 250
Adjusting Eggs by 1
Adjusting Eggs by 1
Adjusting Extra Virgin Olive Oil by 0.25
Adjusting Extra Virgin Olive Oil by 0.25
Adjusting Extra Virgin Olive Oil by 0.25
Adjusting Extra Virgin Olive Oil by 0.25
Adjusting Extra Virgin Olive Oil by 0.25
Adjusting Extra Virgin Olive Oil by 0.25
Adjusting Extra Virgin Olive Oil by 0.25
Adjusting Extra Virgin Olive Oil by 0.25
Adjusting Extra Virgin Olive Oil by 0.25
Adjusting Extra Virgin Olive Oil by 0.25
Adjusting Broccoli by 10
Adjusting Broccoli by 10
Adjusting Broccoli by 10
Adjusting Broccoli by 10
Adjusting Broccoli by 10

name                          #      Cal      Fat      Fib      NCb      Pro
goals_unadjusted                   2,578      221       36       20      128
goals                              1,934      149       27       20      128
actuals                            2,145      162       36       17      122
difference                           211       13        9       -3       -6


name                          #      Cal      Fat      Fib      NCb      Pro
Coconut Oil                   1      130       14
Fish Oil                    0.5       56        6
Extra Virgin Olive Oil      5.5      660       77
Eggs                          7      490       35                         42
Arugula                     145       36        1        2        3        4
Collared Greens             100       33        1        4        2        3
Romaine                     300       51        1        6        3        4
Broccoli                    250       59                 9        3        6
Mushrooms                   100       23        0        1        2        3
Radish                      100       16        0        2        2        1
Salsa                         4       20                 2                 2
Avocado                     140      224       20       10        3        3
Mustard                       4       60
Chicken                   250.0      288        7                         55
```
