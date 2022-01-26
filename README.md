```
$ node health --help
Usage: health [options]

Options:
  -p, --profile              Derive profile information only
  -C, --chicken [grams]      Chicken
  -S, --salmon [grams]       Salmon
  -B, --beef [grams]         Beef
  -P, --pork-chop [grams]    Pork chop
  -s, --slack                Send summary to slack
  -w, --weight <weight>      Weight (lbs)
  -f, --body-fat <body-fat>  Body fat percentage
  -b, --burned <burned>      Calories burned beyond BMR per day
  -h, --help                 display help for command


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
