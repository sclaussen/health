# Installation

1. Install Node.JS
1. `mkdir ~/src && cd ~/src` (as an example)
1. `git clone git@github.com:sclaussen/health.git` (or get the zip file and unzip it)
1. `cd ~/src/health`
1. `npm i`



# Setup

Using the -s slack option requires slack setup and the following environment variable:
- HEALTH_SLACK (enter slack channel info if using slack)



# Profile Usage

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


# Meal Usage

```
$ health -w 190 -f 25 -b 500 -C 250
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
