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
  - **sex**: male or female
  - **height**: in inches
  - **birthday**: YYYY-MM-DD format
  - **weight**: in lbs
  - **body_fat_pct**: I get this from my withings scale, other options are
    to guess, or use neck/waste measurement based formula (you can
    fine this online).
  - **calories_burned**: I use a garmin fenix watch but you need some
    mechanism to estimate how many additional calories you burn a day
    as the result of exercise, walking, etc.
  - **activity_ratio**
  - all the other profile configuration values are derived so ignore them for now
- Run `node health -p`

  - This will derive the remaining profile] configuration values,
    display them, as well as update them in your dat/health.yaml
    configuration file.  Here is what is dervied and how it pertains
    to meal planning:

    - **Gross Daily Caloric Goal**: You profile data is used to
      calculate your base metabolic rate
      (**calories_base_metabolic_rate**), then that * 1.2 determines
      your resting caloric requirement (**calories_resting**), then
      I add your exercise burned calories to determine your total
      caloric requirement (**calories_goal_unadjusted**).

    - **Net Daily Caloric Goal**: If you are trying to lose weight,
      there's an deficit percentage that lowers your daily caloric
      consumption goal defined by (**deficit_pct**).  Applying that
      value to the unadjusted caloric goal we get your adjusted
      calorie goal for the day (**calories_goal**).  This value is
      used to determine your macro goals (fat and protein), as well as
      your daily fiber and water goals.

    - **Daily NetCarbs Goal**: This value represents the max number
      of netcarbs (carbs minus fiber) that you want to consume in a
      day.  Define it using **netcarbs_goal**.

    - **Protein Activity Ratio**: The **activity_ratio** defines
      how many grams per pound of lean body mass you need to
      maintain/grow your muscle mass.  Valid values can be found on
      the web.  This value in combination with your derived lean body
      mass are used to determine how many grams of protein you need
      (**protein_goal**).

    - **Fat Goal**: Since your netcarbs is a constant, and your
      protein goal is a function of you activity level, the remaining
      calories you need to consume are a function of fat
      (**fat_goal**).

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



# My Exeperience

## Overview

Since I began my personal health crusade I've been doing deep dives on
various topics related to personal health and nutrition.  Through that
process I've developed some strong views, all of which are loosely
held, and ever evolving.  Here's a quick snapshot of my current
perspective:

- **Change**: I changed five things to get healthier:

  - (1) **quality**: improved the quality of the food I consumed,
  - (2) **fast**: used time restricted feeding to change when I ate,
  - (4) **keto**: went on a low carb high fat Keto based diet,
  - (3) **exercise**: added a walking exercise program, and
  - (5) **sleep**: improved my sleep habits.

  If I had to give up four of those and pick the one that I think most
  impacts my health it would be time restricted feeding.  That said,
  they are different levers that work together on the war against
  insulin resistance and I'd be hard pressed to give any of them up as
  I think they are all been critical for my own health journey.

- **Longevity**: I've come to the view that it's all about longevity,
  both health span (quality of life) and life span (length of life).
  All my strategic views are measured against the meta goal of
  longevity.  Based on existing and ongoing clinical studies and
  research (eg David Sinclair @ Harvard, David Sabatini @ MIT, Matt
  Kaeberlein @ Univ of Washington, Steve Horvath @ UCLA, et al) I now
  believe there are mechanisms that can attack the process of aging
  and as a result reverse aging on parts of the body resulting in
  extending both health and life span (eg sirtuins, rapamycin, mTOR,
  metformin, et al).  This is an extremely hot and very active field
  of research.

- **Insulin**: One of the most important things I've learned is that
  insulin resistance is the foundational element of most of the
  chronic diseases (eg heart disease, cancer, stroke, Alzheimers, and
  type 2 diabetes).  The design center of my daily tactical nutrition
  and health focus is insulin management.

- **Nutrition vs Exercise**: I now believe both what you eat and when
  you eat are far more important components of health than exercise
  (8:2 or 9:1).  I've always had this one completely upside down, and
  I wish I'd come to this conclusion far sooner.

- **When**: I now believe that when you eat, and how often you eat, is
  more important than what you eat (assuming you eat a quasi healthy
  diet).  This was the most eye opening thing I've discovered thus
  far.  Intermittent fasting is in my view the easiest way to fight
  insulin resistance and the quickest way to dramatically impact your
  health positively.

- **Quality**: I thought we ate pretty well, but when we went through
  our foods, in detail, evaluating each of them, we found many things
  I'm ashamed of in retrospect.  How about a web api that takes photos
  of all your foods and send you back a "quality" score?

- **Walking**: After doing a lot of research I realized that walking
  is a far better form of exercise than I'd previously understood.

- **Fruit**: Everyone should be well informed on non-alcoholic fatty
  liver disease (NAFLD), its health implications, and what the source
  is (corn syrup/fructose and thus processed foods and fruits).

- **Antiquated Thinking**: Many health care professionals are still
  working from antiquated scripts.  Oddly enough, doctors are not
  trained in nutrition.  I encourage you to do stop listening to
  others (me included), get off the fence, and do your own research.
  Know the science.

- **Food Industry**: I've reaffirmed my view of the food industry.  I
  believe they are just like tobacco.  There are 10 companies with
  dominant control over 85% of the calories we consume, that use
  organic chemistry and sugar (in various forms, fructose being one of
  the worst), to optimize their profit margins, knowing full well the
  health pandemics they are creating in the broader population.  This
  is the ugly underbelly of capitalism.

- **Is sugar the next tobacco?**: I predict added sugar will go down
  in history as this generation's tobacco.  Refined carbohydrates are
  pure evil.  Processed foods are essentially profit driven synthetic
  drugs.



## How do you get started?

Several people have asked me for a summary of what I'd recommend to
get started (independent of your current health status).  Here's a
quick list:

- Educate yourself on the science so you know how what you're eating is impacting the hormones that control your metabolism
  - Start with [The Obesity Code (Jason Fung)](https://www.amazon.com/The-Obesity-Code-Dr-Jason-Fung-audiobook/dp/B01MRKEO0U/ref=tmm_aud_swatch_0?_encoding=UTF8&qid=&sr=) (even if you're young and in perfect health)
  - Look through [Peter Attia's podcast archives](https://www.youtube.com/c/PeterAttiaMD/videos) for relevant topics
- Stop consuming any foods with added sugar (using any of [the 56 different names for sugar](https://www.virtahealth.com/blog/names-for-sugar))
- Stop snacking between meals
- Stop consuming processed foods
- Skip breakfast
- Stop drinking any calories
- Dramatically reduce (or stop) your consumption of refined carbohydrates
- Dramatically reduce (or stop) consumption of foods containing sugar
- Stop cooking in bad oils
- Improve your sleep habits
- Upgrade the quality of the food that you should be consuming
- Research time restricted feeding (aka intermittent fasting), get started with a 16:8 plan
- Research Keto and seriously consider it (for those with a BMI > 25 or pre-diabetes/diabetes)



## Reference

### Books
* [The Obesity Code (Jason Fung)](https://www.amazon.com/The-Obesity-Code-Dr-Jason-Fung-audiobook/dp/B01MRKEO0U/ref=tmm_aud_swatch_0?_encoding=UTF8&qid=&sr=)
* [The Diabetes Code (Jason Fung)](https://www.amazon.com/The-Diabetes-Code-Dr-Jason-Fung-audiobook/dp/B07BR3LZW7/ref=sr_1_2?dchild=1&gclid=CjwKCAjwjJmIBhA4EiwAQdCbxlFwLssM3Yq84EaD-SU8dzxKmOG08Uf42218_PwBEf5wVxXe4tDVNBoCAIMQAvD_BwE&hvadid=190507101721&hvdev=c&hvlocphy=9031975&hvnetw=g&hvqmt=e&hvrand=8135077100042644456&hvtargid=kwd-296811089911&hydadcr=15496_9860510&keywords=the+diabetes+code&qid=1627845590&sr=8-2)
* [The Cancer Code (Jason Fung)](https://www.amazon.com/dp/B084RGT3H4?plink=flWCd4fbYNdfDg0X&ref=adblp13nvvxx_0_0_im)
* [Why We Get Sick (Benjamin Bikman)](https://www.amazon.com/Why-We-Get-Sick-Epidemic/dp/B0899DP434/ref=sr_1_1?dchild=1&keywords=why+we+get+sick&qid=1624560739&s=audible&sr=1-1)
* [The Case for Keto (Gary Taubes)](https://www.amazon.com/s?k=the+case+for+keto&gclid=CjwKCAjwieuGBhAsEiwA1Ly_nWYZi4rZGM5JfbvnAX46KVCXwmrUBM9ZYAkBmxm7A-aWdpONarFzbhoCw_AQAvD_BwE&hvadid=416744105949&hvdev=c&hvlocphy=9031975&hvnetw=g&hvqmt=e&hvrand=10029320316729189384&hvtargid=kwd-871459532323&hydadcr=22536_9636733&tag=googhydr-20&ref=pd_sl_7q2cbifsgv_e)
* [Why We Sleep (Matthew Walker)](https://fastlifehacks.com/matthew-walker-12-tips-for-good-sleep/)
* [Lifespan (David Sinclair)](https://www.amazon.com/Lifespan-Why-Age_and-Dont-Have/dp/1501191977)

### Subject matter experts
* [Peter Attia (The Drive)](https://peterattiamd.com) [--youtube--](https://www.youtube.com/channel/UC8kGsMa0LygSX9nkBcBH1Sg): Longevity
* [Jason Fung (The Fasting Method)](https://thefastingmethod.com) [--youtube--](https://www.youtube.com/user/drjasonfung): Insulin/Fasting
* [Rhonda Patrick (Found My Fitness)](https://www.foundmyfitness.com) [--youtube--](https://www.youtube.com/c/FoundMyFitness/videos): Longevity
* [David Sinclair (Harvard)](https://www.youtube.com/results?search_query=david+sinclair): Longevity
* [David Sabatini (MIT)](https://www.youtube.com/results?search_query=david+sabatini): mTOR
* [Steve Horvath (UCLA)](https://www.youtube.com/results?search_query=steve+horvath): Inner Age
* [Matthew Walker (Berkeley)](https://www.youtube.com/results?search_query=matthew+walker): Sleep
* [Robert Lustig (UCSF)](https://www.youtube.com/results?search_query=robert+lustig): Fructose/etal
* [Richard Isaacson (Cornell)](https://www.youtube.com/results?search_query=richard+isaacson): Alzheimers
* [Valter Longo (USC)](https://www.youtube.com/results?search_query=valter+longo): Fasting
* [Andrew Huberman (Stanford/Huberman Lab)](https://www.youtube.com/channel/UC2D2CMWXMOVWx7giW1n3LIg)
* [Matt Kaeberlin (Univ Washington)](https://www.youtube.com/results?search_query=Matt+Kaeberlein)

### Health/Nutrition/Longevity YouTube personalities (useful but beware):
* [Mark Sisson](https://www.marksdailyapple.com)
* [Gary Taubes](https://www.youtube.com/results?search_query=gary+taubes)
* [Mark Hyman](https://www.youtube.com/user/ultrawellness)
* [Bobby Parrish](https://www.youtube.com/user/flavcity)
* [Brad Stanfield](https://www.youtube.com/user/bsta045)
* [Lance Hitchings](https://www.youtube.com/channel/UCM5hf97Y7N8cEI6bc74Mp2g)
* [Sten Ekberg](https://www.youtube.com/user/drekberg)
* [Eric Berg](https://www.youtube.com/user/drericberg123)
* [Becky Gillaspy](https://www.youtube.com/user/beckygillaspy)
* [Thomas DeLauer](https://www.youtube.com/user/TheTdelauer)
* [2 Fit Docs](https://www.youtube.com/c/2FitDocs/videos)
* [High Intensity Health](https://www.youtube.com/user/highintensityhealth)
* [Autumn Bates](https://www.youtube.com/channel/UCkPBo8hqEOiE3bg9t7ZGT2Q)

### General podcasts that often have a health/nutrition focus
* [Tim Ferriss](https://www.youtube.com/user/masterlock77)
* [Tom Bilyeu](https://www.youtube.com/channel/UCnYMOamNKLGVlJgRUbamveA)
* [Joe Rogan](https://www.youtube.com/user/PowerfulJRE)
* [Lex Fridman](https://www.youtube.com/channel/UCSHZKyawb77ixDdsGog4iWA)

### Highlighted interviews
- Jason Fung (Insulin Resistance)
  * [by Tom Bilyeu](https://www.youtube.com/watch?v=XhPwjmbkgDs)
  * [by Gary Taubes](https://www.youtube.com/watch?v=QAim7IASsEg)
- Benjamin Bikman (Insulin)
  * [by Andreas Eenfeldt](https://www.youtube.com/watch?v=AhRCX3nNhA4)
  * [by Tom Bilyeu](https://www.youtube.com/watch?v=QAbpE0_6ayg&list=PL8qcvQ7Byc3NthekE8Zsdk8my0QnRJzee&index=5&t=654s)
- David Sinclair (Longevity)
  * [by Joe Rogan](https://open.spotify.com/episode/55UlxYWPfV46f7puMkZPeD?si=WBxKap8wSb-hUv-dV7Q2ig&nd=1)  --[fasting clip](https://www.youtube.com/watch?v=cUwd-D94pzE&t=73s)--
  * [by Rhonda Patrick](https://www.youtube.com/watch?v=5DtWqzalEnc)
  * [by Lex Fridman](https://www.youtube.com/watch?v=jhKZIq3SlYE)
- Steve Horvath (Longevity)
  * [by Rhonda Patrick](https//www.youtube.com/watch?v=A_aaBKubJnA&t=1376s)
- Matt Walker (Sleep)
  * [by Peter Attia](https://www.youtube.com/watch?v=5stcuh065Vk)
- Richard Isaacson (Alzheimers)
  * [by Peter Attia](https://peterattiamd.com/richardisaacson)
  * [by Peter Attia #2](https://peterattiamd.com/laurenmillerrogen-richardisaacson)

### Useful items
* [Withings Body+ Scale](https://www.amazon.com/Withings-Nokia-Body-Composition-smartphone/dp/B071XW4C5Q/ref=sr_1_1_sspa?dchild=1&keywords=withings+scale&qid=1624559620&sr=8-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExOU5JVkFSOTZKUks1JmVuY3J5cHRlZElkPUEwMjQzNDg0QVlQTDFINUZDVjNEJmVuY3J5cHRlZEFkSWQ9QTA5NzM2NDNSNkRYMkVVWjBKQ1Qmd2lkZ2V0TmFtZT1zcF9hdGYmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl): This scale captures body fat % which is necessary to determine my macro consumption goals
* [Nicewell Food Scale](https://www.amazon.com/gp/product/B07S6F6LHQ/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1): Use it daily to prepare my meal
* [OXO Good Grips 3-in-1 Avocado Slicer](https://www.amazon.com/OXO-Good-Grips-Avocado-Slicer/dp/B0088LR592/ref=sr_1_5_0o_fs?crid=2Y5LBORVFUJ7D&dchild=1&keywords=avocado+tool&qid=1624559529&sprefix=avocado+%2Caps%2C236&sr=8-5): Incredibly useful for scooping avocados
* [Timoo Coffee Measuring Scoop 1 Tablespoon, Set of 5: Kitchen & Dining](https://www.amazon.com/Timoo-Coffee-Measuring-Tablespoon-Stainless/dp/B07HD2TZ2M/ref=sr_1_6?dchild=1&keywords=tablespoons&qid=1624559569&sr=8-6): Useful as I measure all liquids in tablespoons
* [Fullstar Vegetable Chopper](https://www.amazon.com/Vegetable-Chopper-Spiralizer-Slicer-Choppers/dp/B0764HS4SL/ref=sr_1_6?dchild=1&keywords=dicer&qid=1624559592&sr=8-6): For dicing salad ingredients, hot peppers, etal
* [Twist Top Food Deli Containers](https://www.amazon.com/gp/product/B077G76C6J/ref=ppx_yo_dt_b_asin_title_o09_s00?ie=UTF8&psc=1): Useful for prepping salad ingredients, et al
* [5 Quart Salad Bowl](https://www.amazon.com/OXO-Good-Grips-5-Quart-Mixing/dp/B0001YH1MU/ref=sr_1_2?dchild=1&keywords=5+quart+oxo&qid=1626811593&sr=8-2) and/or [3 Quart Salad Bowl](https://www.amazon.com/OXO-Grips-3-Quart-Mixing-White/dp/B00004OCMY/ref=sr_1_5?dchild=1&keywords=3+quart+oxo&qid=1626811632&sr=8-5): For huge salads

### My supplements
* [Fish Oil (Omega-3)](https://www.amazon.com/dp/B001LF39S8/ref=twister_B0047VWYSO?_encoding=UTF8&psc=1): What I've started using to supplement Omega-3s
* [SlowMag (Mg/Ca)](https://www.amazon.com/SlowMag-Magnesium-Chloride-Calcium-Supplement/dp/B07CJX4M8K/ref=sxts_sxwds-bia-wc-rsf1_0?cv_ct_cx=slow+mag&dchild=1&keywords=slowmag&pd_rd_i=B07CJX4M8K&pd_rd_r=458fbfae-ef08-44fd-bd0f-86d9d433db3e&pd_rd_w=U8kBr&pd_rd_wg=rA9RM&pf_rd_p=5168df84-062d-4bdf-8a6e-2680813bd42f&pf_rd_r=VK1YWSAKY34QDA930PRP&psc=1&qid=1615496082&s=hpc&sr=1-1-7bf78e84-8ef2-4f13-9926-bee5153e81cb): Magnesium supplement
* [Vitamin D](https://www.amazon.com/Thorne-Research-Vitamin-Supplement-Capsules/dp/B0797H3VQS/ref=sxts_rp_s1_0?cv_ct_cx=vitamin+d&dchild=1&keywords=vitamin+d&pd_rd_i=B0797H3VQS&pd_rd_r=93d0baef-8080-4321-84a4-b949f0b86710&pd_rd_w=Mpa1y&pd_rd_wg=lCMMj&pf_rd_p=c6bde456-f877-4246-800f-44405f638777&pf_rd_r=V08DPSFTQN5Y8GPBYDXD&psc=1&qid=1626811544&sr=1-1-f0029781-b79b-4b60-9cb0-eeda4dea34d6)
* [Endure (electrolytes)](https://www.amazon.com/Trace-Minerals-Research-Performance-Electrolyte/dp/B000VDLD9S/ref=sr_1_3_sspa?dchild=1&keywords=endure&qid=1626811510&sr=8-3-spons&psc=1&smid=A1SGUUCL70EYZE&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFTVU44VDAwWjBCWTImZW5jcnlwdGVkSWQ9QTA3MDAzMjAzSllITk1EVVZaNVVNJmVuY3J5cHRlZEFkSWQ9QTAxMTE4NTQxTDZYTk9TUFdFVTRKJndpZGdldE5hbWU9c3BfYXRmJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==)
* Good reading on supplements:
  * [Peter Attia](https://fastlifehacks.com/peter-attia-supplements-diet-exercise)
  * [David Sinclair](https://fastlifehacks.com/david-sinclair-supplements/?utm_source=wppp)
  * [Rhonda Patrick](https://fastlifehacks.com/dr-rhonda-patricks-supplements-list/?utm_source=wppp)
  * [Joe Rogan](https://fastlifehacks.com/joe-rogan-supplements/?utm_source=wppp)

### Other useful links
* [Dirty dozen (pesticide analysis)](https://www.ewg.org/foodnews/dirty-dozen.php)
* [Cornucopia scorecards](https://www.cornucopia.org/scorecards/)
* [Cornucopia eggs scorecard](https://www.cornucopia.org/scorecard/eggs)
* [Glycemic index](https://www.health.harvard.edu/diseases-and-conditions/glycemic-index-and-glycemic-load-for-100-foods)
* [Insulin index](https://optimisingnutrition.com/food-insulin-index-2/)
* [Oxalate Dirty Dozen p1](https://lowoxcoach.com/the-oxalate-dirty-dozen-part-1) and [Oxalate Dirty Dozen p2](https://lowoxcoach.com/the-oxalate-dirty-dozen-part-2)
* [Global Animal Partnership Step 4](https://www.greenerchoices.org/global-animal-partnership-step-4)
* [Supplement Ratings and Reviews (Labdoor)](https://labdoor.com)
* [Supplement Certifications (Nutrasource)](https://certifications.nutrasource.ca/certified-products)
* [FastLifeHacks.Com](https://fastlifehacks.com)



# Quality

## Summary

Although I understand that food is a very personal thing (just ask my
son), I'm providing the following with full transparency as an example
of what I did with some of the logic behind the why.  As I read and
learn, the list below evolves, although the degree of evolution at
this point is relatively low.  This list isn't in any particular
order.

After establishing some criteria my process was essentially:
- Go through the pantry and refrigerator, literally item by item, reading every nutrition label and ingredients list carefully...
- Research any ingredient I'd never heard of
- Remove foods with added sugars (with very few exceptions)
- Remove anything processed (with very few exceptions)
- For foods that we felt were required, or that the family wasn't willing to give up, do research on the web to find healthier variants
- Research food we weren't eating, or weren't eating nearly enough of, that were super healthy, and begin consuming more of those foods

This was an iterative process that took us several months and still
evolves a bit.  What I've tried to do below is capture what changes we
made as a starting point for others to consider (or point out areas
where we could still do better).

Of the 5 areas I've focused on, my family does not do time restricted
feeding nor Keto, but they've improved their food quality, exercise,
and sleep patterns.  I've tried to point out below the changes that
are specific to my more restricted Keto based diet and the additional
food they consume.

I initially used diet doctor as a nice visual way to observe the carb
content of various foods so I've included some of those useful images.
In general, I stay in the green, rarely go into the orange, and my
family is less strict.

![](https://i.dietdoctor.com/wp-content/uploads/2019/03/keto-diet-guide.jpg?auto=compress%2Cformat&w=800&h=392&fit=crop)
![](https://i.dietdoctor.com/wp-content/uploads/2019/03/keto-diet-guide-avoid2.jpg?auto=compress%2Cformat&w=800&h=401&fit=crop)



### Liquids

- Criteria
  - Do not drink your calories (insulin management)

- We refrain from consuming **any** calories in liquid form (eg sports
  drinks, orange juice, milk, smoothy, et al) (the exception is my
  wife still adds some sugar to her morning chai) (insulin management)
  - I drink black coffee atleast once a day
  - I drink hot green tea
  - I drink black iced tea
  - I consume a lot of water (I try very hard to hit my minimum daily
    water requirement daily)

- I rarely drink alcohol, when I do I try to consume alcohol with zero
  carbs (insulin management, NAFLD)



### Sweeteners

- Criteria
  - Avoid any foods with sugar or added sugar (insulin management)
  - Avoid sweeteners that raise my insulin levels even if they don't raise my blood sugar levels (insulin management)

- I removed all foods from my diet that contain added sweeteners of any type
  - The exception is 85-92% dark chocolate that by definition is cocoa
    plus added sugar



### Sauces & Spices

- Criteria
  - Remove spices that contain carbohydrates (keto)
  - Remove spices that increase oxalates (keto)

- I frequently consume spices including:
  - garlic
  - ginger
  - black pepper
  - chili pepper
  - garam masala (mix)
  - ...

- I frequently add stone ground mustard to my salads and our family
  uses it on burgers to increase the spice.  We upgraded to a higher
  quality stone ground organic mustard.

- I'm careful when consuming spices that contain carbs.

- I typically refrain from consuming turmeric (although it has a lot
  of nutritional value) due to its high oxalate content.

- I use a hot salsa as a staple to spice up my omelette and/or salad.
  We improved the quality of the salsa we use to one that includes
  only natural ingredients and zero netcarbs (that also contributes a
  healthy amount of fiber).

- We removed any of the spices that were processed, contained any
  non-natural ingredients, or added sugars (eg ketchup).



### Oils

Criteria:
  - Avoid cooking and topping oils that use heat and/or chemical
    extraction - eg vegetable, soybean, corn oils, ... (inflammatory,
    et al)
  - Use cooking oils with high smoke points (inflammatory, et al)
  - Beware that when you eat out your food will typically be cooked in
    bad oils because they are cheap

- We add extra virgin olive oil (typically organic) to our salads
  (healthy fat).

- The rest of my family also uses vinegar as a topping oil (higher
  carb footprint).

- We cook eggs in organic coconut oil (MCTs, higher smoke point).

- We cook most everything else in organic avocado oil (high smoke
  point).

- On occasion we'll cook in butter or ghee (primarily organic grass
  fed/grass raised ghee).



### Meats

- Criteria (balanced omega 3/6 ratio, vitamins/minerals):
  - Grass raised/finished beef
  - Organic pasture raised eggs
  - Wild raised fish
  - Organic chicken
  - Non-GMO crate free pork
  - Avoid added nitrites/nitrates
  - Avoid mercury from large fish
  - Dramatic reduction of processed meats (cancer)
  - Avoid **trans fats** (some small amount creeps into Whole Foods meat from time to time)

- In general, we probably eat about the same amount of meat as before, but:
  - We've increased the quality across the board (impacting omega-3/6 ratios, vit/minerals)
  - We've increased the frequency of salmon and thus omega-3s
  - We've all increased our egg consumption
  - I've added the smaller fish as well to increase my omega-3s

- We primarily consume chicken, beef, pork chops, salmon, cod, eggs,
  and infrequently lamb, venison, and bacon.

- We try to consume salmon twice a week (omega 3s).

- I also consume sardines, mackerel, and occasionally tuna (for omega
  3s).

- I avoid all high mercury content fish, and limit tuna consumption to
  once per month max (avoiding mercury).  The rest of my family avoids
  all high mercury content fish altogether.

- We source the majority of my chicken, beef, pork chops, salmon, and
  cod from [ButcherBox](https://www.butcherbox.com/).  If we buy meat
  locally, we usually purchase [Step
  4](https://www.wholefoodsmarket.com/quality-standards/meat-standards)
  or better products.

- Chicken
  - We consume organic, free range, non-GMO chicken ([Butcher Box
    FAQ](https://support.butcherbox.com/hc/en-us/articles/115015793928-Can-you-tell-me-about-your-chicken-))

- Beef
  - We consume grass raised and grass finished beef ([Butcher Box
    FAQ](https://support.butcherbox.com/hc/en-us/articles/360000094648-Can-you-tell-me-about-your-beef-))

  - Even though I consume a lot of fat in my diet (approx 70%) I will
    consume 80%/20%, 85%/15%, and 90%/10% bee (typically it's
    85%/15%).  That said, if given a choice I'll eat leaner meat not
    because I'm trying to avoid fat, but as a way to provide me
    flexibility wrt how I add high quality fat to my meal (eg extra
    virgin olive oil, nuts, et al).

- Salmon
  - We consume wild vs. farm raised (omega 3/6 ratio)
  - We consume Wild Alaskan Sockeye almost exclusively (high omega 3 content)

- Sardines, Atlantic Mackerel, Albacore Tuna
  - All sourced from [Wild Planet](https://wildplanetfoods.com/?utm_source=IMM&utm_medium=GG-Search&utm_term=115871110784&utm_content=wild%20planet&utm_campaign=11120638040&utm_a=115871110784) (omega 3s)

- Pork
  - Humanely raised, crate free, non-gmo ([Butcher Box](https://support.butcherbox.com/hc/en-us/articles/115015713087-Can-you-tell-me-about-your-pork-))

- Eggs
  - We consume organic pasture raised eggs (typically sourced from
    [Vital Farms](https://www.cornucopia.org/scorecard/eggs/vital-farms))
  - Recently I purchased a dozen organic pasture raised eggs from
    Whole Foods produced by local farm (Clover) before verifying the
    farm's rating on cornucopia.  These eggs typically sell for
    $7.29/dozen so they are expensive and I figured that meant high
    quality local eggs.  Big mistake!  The shell of the first Clover
    egg I cracked was obviously far thinner than the Vital eggs I was
    used to, and the yellow/bland color of the yolk made it obvious
    that they were lower quality (less nutrients).  Here's a photo of
    Clover and Vital eggs.  Is it obvious which egg is which?!

    <img src="./images/eggs.png" alt="eggs" width="200"/>

- Bacon
  - Humanely raised, crate free, non-gmo ([Butcher Box](https://support.butcherbox.com/hc/en-us/articles/115015713087-Can-you-tell-me-about-your-pork-))
  - I ate bacon in the early stages as I changed my diet but now eat
    it far less infrequently although it's a valid option.
  - The resr of my family eats bacon occasionally.
  - We are very particular about the type of bacon we eat (no
    nitrites/nitrates, no other added ingredients).  We typically
    source our bacon from Butcher Box.
  - Due to the studies correlating processed meat to cancer we've
    dramatically lower our consumption level.

- Hot dogs
  - Due to the studies correlating processed meat to cancer we've
    dramatically lower our consumption level.
  - We eat these occasionally, like BBQ, sourced from Butcher Box.

- Sandwich Meats
  - I abstain altogether
  - For my son, we upgraded our sandwich meat to a couple brands that
    are very low carb (< 1g), contain no sugar, no added sugar, and
    contain no non-natural ingredients.
  - Due to the studies correlating processed meat to cancer we've
    dramatically lowered his consumption.



### Vegetables

- Criteria:
  - Be careful with high oxalate vegetables (Keto hydration challenges)
  - Be careful with higher carb footprint leafy greens (keto)
  - I refrain from all the starchy vegetables and other high carb footprint vegetables
  - Add more vegetables to the diet
  - Use vegetables as a key source of fiber, vitamins, and minerals

- In general, although I ate a lot of salads for lunch before, I've
  now massively increased my salad size, and the amount of vegetables
  I consume daily, and they have become my goto food group that I
  crave.  My family has also increased their vegetable uptake
  dramatically (eg my son eats a salad w/dinner nightly now).

- Leafy Greens

  - I currently consume a combination of baby arugula, collared
    greens, and romaine in my salad.

  - I have used spinach and swiss chard historically, but I now
    refrain from using them due to their high oxalate levels (although
    I love them all).

  - I love kale as well, particularly dino, but it has a relatively
    high carb footprint if you're building a large salad with it (like
    I do), so I now typically refrain from using kale.

  - I have used cabbage from time to time, but it has a high carb
    footprint as well.

  - The rest of my family uses either arugula, collared greens,
    romaine, spinach, kale, and cabbage in their salads and they eat
    salads with almost every dinner now.

- Avocados (actually a fruit) are a key staple of my diet.  I eat
  atleast one full avocado a day (usually in my salad).

- Lots of broccoli and cauliflower are pretty much daily staples in my
  salad.  I eat them quasi raw (or slightly steamed/mildly heated) in
  order to preserve their nutritional value.

- My key set of vegetables are:
  - mushrooms
  - radish
  - broccoli
  - cauliflower
  - asparagus
  - brussel sprouts
  - green beans
  - serrano peppers
  - zucchini

- I'll also have tomatoes, onions, carrots, peas, etal, but they have
  a higher carb footprint so I don't eat them very frequently.  The
  family eats these pretty consistently.

- I avoid most most everything else including starchy vegetables.  My
  family consumes the starchy vegetables and the higher carb
  vegetables occasionally.

![](https://i.dietdoctor.com/wp-content/uploads/2019/02/Keto-vegetables-AG.jpg?auto=compress%2Cformat&w=1200&h=541&fit=crop)

![](https://i.dietdoctor.com/wp-content/uploads/2019/01/Vegetable-sticks2.jpg?auto=compress%2Cformat&w=1200&h=592&fit=crop)

![](https://i.dietdoctor.com/wp-content/uploads/2019/01/Keto-vegetables-BG-3.jpg?auto=compress%2Cformat&w=1200&h=387&fit=crop)



### Fruits

- Criteria:
  - Avoid fructose (non-alcoholic fatty liver disease)
  - Avoid high carb foods (keto)

- Generally speaking, due to their high carb content and the health
  issues associated with fructose/NAFLD, I simply have stopped
  consuming fruits altogether.  I used to eat a TON of fruit so this
  was a major change, but health is so much more important.  The
  family has reduced their fruit consumption quantity as well.

- If I do consume fruit (delta avocado), it's one of the berries:
  - strawberry
  - blackberry
  - raspberry
  - blueberry
  due to their relatively low carb footprint and other nutritional
  properties.  However, it's pretty rare.

- I will consume lemons in my water around mealtime on occasion as
  their acidity helps break down the calcium oxalates and aids in
  speeding up digestion which offsets their carb content.

- My family consumes a greater amount of fruit than I do although
  they've dramatically lowered their overall consumption.  In
  addition, for the most part, we avoid the really high carb footprint
  fruits like grapes.

- We used to create fruit smoothies, we've discontinued that practice
  as it really spikes the insulin levels (insulin management).

![](https://i.dietdoctor.com/wp-content/uploads/2019/01/Keto-berries.jpg?auto=compress%2Cformat&w=1200&h=423&fit=crop)

![](https://i.dietdoctor.com/wp-content/uploads/2019/01/Keto-Fruits-1.jpg?auto=compress%2Cformat&w=1200&h=699&fit=crop)



### Dairy

- In general, I've increased my cheese consumption now that I need
  good fats and I have a handle on the macro nutrient impact of what
  I'm eating.  We've removed any/all processed cheese.  We are
  fortunate in that we don't have any lactose intolerance.

- I stopped consuming milk long ago due to its high carb content
  (lactose, insulin management).  However, I was a habitual latte
  consumer, and would also add milk/cream to my coffees.  I have
  ceased drinking lattes (in fact they now taste too sweet as I've
  lost some of my sweet tooth) and I drink coffee black (insulin
  management and keto).

- My son drinks milk to support his calcium growth RDA, but we've
  upgraded to:
  - whole milk (increased fat for improved insulin management)
  - grass fed/grass finished source (omega 3/6 ratio,
    vitamins/minerals)

- We consume a lot of cheese (typically feta, parmesan, blue,
  mozzarella, mitica, manchego, gouda, emmentaler, ...).

- We improved the quality of our yogurt by changing to one that is
  whole milk without added sugar.

![](https://i.dietdoctor.com/wp-content/uploads/2020/10/Dairy_desktop.jpg?auto=compress%2Cformat&w=1200&h=583&fit=crop)



### Nuts

- Criteria
  - Raw
  - Organic
  - Lower carb
  - Avoid high oxalates

- In general, we've increased our consumption of nuts due to their
  nutritional value.

- We consume raw nuts (more antioxidants and vitamins).

- We typically consume organic nuts.

- I consume macadamia, pecans, walnuts, sometimes coconut (I avoid
  both hazel and brazil nuts due to allergies).  I refrain from all
  the other higher carb footprint nuts (like pistachio and cashew)
  (keto).

- I will consume higher carb footprint nuts like peanuts every
  once in a while (keto).

- The family also consumes peanuts, pistachios, and cashews.

- I refrain from almonds due to high oxalates.

- For the nut oils:
  - I don't consume them due to their carb footprint.
  - We upgraded out peanut butter brand (no added sugar, no
    non-natural ingredients).
  - We added sunflower butter and almond butter as healthier
    alternatives to peanut butter and now use all three.

![](https://i.dietdoctor.com/wp-content/uploads/2019/01/Keto%E2%80%93Nuts.jpg?auto=compress%2Cformat&w=1200&h=602&fit=crop)



### Seeds

- In general, I consume low carbohydrate seeds as a mechanism to
  maintain minimum daily fiber requirements and as a source of
  vitamins and minerals including:
  - chia seeds
  - flax seeds
  - pumpkin seeds

- More recently, I obtain my fiber goal easily through my vegetable
 intake so I have decreased my consumption of chia and flax seeds.  I
 continue to use pumpkin seeds for the nutritional value (eg Mg) and
 good fats.



### Grains, Legumes, ...

- In general, this is probably the area where the most change happened in the house!

- My position here is simple.  I no longer consume any legume or grain
  based food, nor will I ever again (keto, carbs, insulin issues, lack
  of vitamins/minerals, ...).

- As far as the rest of the family goes:
  - We removed cereal from our pantry forever (life long ban).
  - We removed several other processed food items that fall into the grain category.
  - My wife decreased her consumption of rice, my son rarely consumes rice now.
  - They have reduced their consumption of dal.
  - They were never large pasta consumers, but there's less pasta consumed.
  - They eat pizza cooked with cauliflower crust.
  - They bake with either almond or cauliflower based flour (without added sugar).
  - The make pancakes and waffles with either almond or cauliflower based flour.
  - They eat tortillos that use cauliflower based flour.
  - We improved the quality of our
    [bread](https://www.amazon.com/Food-Life-Organic-Sprouted-Grain/dp/B000REY4MO?pd_rd_w=YIsVG&pf_rd_p=a1584eb5-51c5-4985-82f8-a9dd97c42360&pf_rd_r=MV9FXD12TGERSTQWB6WG&pd_rd_r=34937361-d46c-47bd-a2c2-3e4b00620356&pd_rd_wg=cpQJQ&pd_rd_i=B000REY4MO&fpw=alm&almBrandId=VUZHIFdob2xlIEZvb2Rz&ref_=pd_alm_wf_bap_d_fp_rp_1_18_t)
    for our son's sandwiches (fewer netcarbs and much greater vitamin/mineral content).

![](https://i.dietdoctor.com/wp-content/uploads/2019/02/Peas-beans-corn-lentils-quinoa1.jpg?auto=compress%2Cformat&w=800&h=296&fit=crop)

![](https://i.dietdoctor.com/wp-content/uploads/2019/01/Grains-sugar-1.jpg?auto=compress%2Cformat&w=800&h=263&fit=crop)



## Other

- **Dark chocolate (85+%)**: Downside is dark chocolate has added
  sugar and thus relatively robust carb footprint and has high oxalate
  content).  That said, I used to frequently use a piece or two as my
  desert, but I have lost most of my sweet cravings at this point.

- **Jelly**: This took a lot of research but we finally found a
  [jelly](https://www.amazon.com/gp/product/B01E4UOFO8/ref=ppx_yo_dt_b_fresh_asin_image_o05?ie=UTF8&almBrandId=VUZHIFdob2xlIEZvb2Rz&fpw=alm)
  we could rationalize putting on our son's peanut butter and jelly
  sandwiches (contains only 8g of sugar, no added sugars, and no
  fructose/corn syrup).  We don't use a lot, and he love sit.

- **Bars**: Bars are processed, so in general, we've discontinued
  using them much at all (I refrain from consuming them at all due to
  their carb content).  However, given our outdoor hiking/climbing
  activities there are occasions where we still use them.  Bars can be
  really unhealthy in so many ways, added sugar and processing are the
  two primary issues.  We've opted for bars with natural ingredients
  without added sugars and are still evaluating different brands.

- **Ice Cream**: We have begun trying Keto based ice cream that have
  an extremely low amount of netcarbs per serving.


# Fasting

I typically use the term intermittent fasting but a lot of people
divide this into two type of fasts:
- Time Restricted Feeding: You have a window each day where you don't eat, and a window of time where you do eat
- Fasting: More complex fasting techniques like multi-day fasts, one day on/one off, 5 days on/2 off, etc.

Here I'm focused primarily on time restricted feeding (please research
the details of all the implications upon your metabolism, insulin, et
al).



## How do you get started???

Initially, I recommend removing all snacking between meals (simple
insulin management).

Find something to drink between meals that's calorie free in addition
to water.  Typically that's black coffee, green tea, or black tea
(I've found espresso tends to have carbs/calories).  Anytime you get
hungry between meals, drink water, make yourself coffee, green tea, or
black tea, and it'll quickly pass.

On day one, I recommend starting out by alternating eating and fasting
in 12 hour windows.  For example, eat between 8am and 8pm, three
meals, without snacks between.  This should be trivial, and it's quite
likely you will find it is easy to skip to the next phase (or skip
this phase altogether).

Next, move to an 16/8 plan, eating during an 8 hour window and fasting
during a 16 hour window.  For example, eat between 11am and 7pm, two
meals, without snacks between, fast the remainder of the time.  Simply
try skipping breakfast, this is a popular option.

When you're comfortable with that, move to an 18/6, 20/4, and/or 22/2
plan, in phases as you are comfortable allowing your body to adjust,
continuing along the same lines, eating two meals, trying to finish by
7pm (as an example) (for good sleep you should finish 3 hours before
you go to sleep).

When you're comfortable with that, try one meal a day (OMAD),
combining all your calories into a single meal, at say 5 or 6pm each
day.  Give yourself atleast 3 hours from the time you're done eating
until you lay done for sleep though.

If you skip directly to one meal a day, or do it too quickly, you're
going to feel overly bloated in that meal trying to consume all your
calories.  Your body will adjust in time though.  In the meantime, you
can space your OMAD meals apart by an hour or two.

Here was my progression as an example:
- On day 1 I stopped snacking between meals.
- On day 8 I began a 16/8 plan (11am-7pm), 3 meals a day.
- On day 11 I transitioned my 16/8 plan to (11am-7pm) 2 meals a day (3 was way too filling for me).
- On day 16 I began a 20/4 plan (3pm-7pm), 2 meals a day.
- On day 18 I tried one meal a day (OMAD) (6-7pm), but reverted to 20/4, as I felt at the time it was too much food at one time (my body wasn't yet able to digest that mount).
- On day 34 I began using OMAD and haven't looked back.  I typically eat around 4:30.



## What do I eat for OMAD?

I basically combine my breakfast, lunch, and dinner into a single
meal, but eat pretty much the same things that I would normally if
they were three different meals.

My meal typically consists of:
- Large Omelette: My staples include serrano peppers and hot salsa
- Large Salad: My staples include various leafy greens, an avocado, mushrooms, radish, extra virgin olive oil, fish oil
- Meat/Vegetable

The advantage of a salad and an omelette is they provide a lot of
flexibility wrt mixing and combining different ingredients.  On
occasion I'll add the omelette and/or the meat directly into the
salad, and other times eat them separately.



## Meal Prep

Here's a [20 minute video of me preparing one of my
meals](https://youtu.be/Zhpz1kxNLD8).  Sorry for the low quality
video, but I thought it might be simplest to watch how I do it vs
read!

My meal prep process is pretty straightforward:

- I typically prep all my vegetables ahead of time to speed up the
  meal prep.  This includes dicing mushrooms, radishes, et al.

- I plan my meal ahead of time using a very custom built for purpose
  spreadsheet so I know how much of what ingredients I'm going to
  prepare.  I usually take an IPhone photo of my plan to recall all
  the details to reference as I'm preparing the meal.

- To keep things simple, I typically either use grams or tablespoons
  as the normalized unit.  Thus, ingredients like leafy greens,
  mushrooms, radish, are added to the bowl using grams, and things
  like olive oil, fish oil, and mustard are added in tablespoon units.
  For other ingredients I'll plan using "N eggs", or "N squares of
  chocolate", etc.

- I put 5qt salad bowl on my grams scale and as I add ingredients to
  the salad, I add them directly into the salad bowl, zeroing out the
  scale after each addition, so I don't have to measure the
  ingredients separately.

- I put a small pot on the scale and add broccoli and/or cauliflower
  (when using those vegetables), zeroing it out as I go, then add
  water, and warm up the vegetables, strain, and dump them directly
  into the salad.

- I add coconut oil to an omelette pan and sautee serrano peppers and
  then add eggs for my omelette, and when it's nearly done cooking I
  add hot salsa (I like it hot).  At times I add the omelette directly
  to the salad.

- Separately I (or my wife) cook the meat and/or other vegetables.  At
  times I add those directly to the salad as well.

Here's a concrete meal preparation example:

- Salad
  - Put a 5qt bowl on the scale, tare it
  - Add 100g of collard greens into the bowl
  - Add 160g of romaine
  - Add 145g of baby arugula
  - Add 100g of diced white mushrooms
  - Add 100g of diced radish
  - Add 140g of avocado (~ medium avocado)
  - Add 4tbsp of extra virgin olive oil
  - Add 0.5tbsp of omega-3 fish oil
  - Add 3tbsp of stone ground mustard
  - Put a small boiling pan on the scale
  - Add 150g broccoli
  - Add 150g cauliflower
  - Add water to the top of the vegetables, heat the vegetables up (I don't boil), strain
  - Dump the broccoli and cauliflower into the salad
  - Mix and toss
- Omelette
  - Add 1tbsp coconut oil to an omelette pan, melt it on low/medium
  - Add 5 diced serrano peppers, sautee
  - Add 5 eggs, cook over low/medium
  - Add 3tbsp salsa
  - Optionally add this to the salad
- Meat
  - Broil 200g of chicken
  - Optionally add this to the salad



## Breaking a Multi-Day Fast

This is simply some of my notes on a multi-day fast.  A work in progress...

- Beware of refeeding syndrome
  - Raising insulin levels quickly will shift the balance of electrolytes
  - No carbs: Important to keep insulin levels low (otherwise electrolyte syndrome)
- Digestive system
  - Less mucous lining in your stomach
- Reintroduce food with protein
- No salt when breaking the fast
- Small portions
- Thiamine: Metabolization of Carbs requires Thiamine
  - Lean salmon, lean chicken, lean turkey, lean pork (also high phosphorous)
- Fats
  - Digestive enzymes are broken down, and it's harder to digest
  - MCT oil is an option as it doesn't require breakdown
  - Saturated fats are hard to break down
  - Mono are pretty hard to break down
  - Poly are easier to break down
- No raw veggies in 24 hours
- Avoid oxalates for two days
- Steamed vegetables are good
- No nuts (w/the exception of macadamia)



# Keto

The Keto part of my health lifestyle is essentially focused on keeping
my net carbohydrate consumption below 20 grams per day.  Doing so
prevents my insulin from spiking as a result of the single meal I eat
each day.

## Setting Macro Consumption Goals

In order to keep me on track I have an fit for purpose spreadsheet
that allows me to determine what my daily goals are for calories, fat,
fiber, netcarbs, and protein.  These goals are all based off a bunch
of calculations based on my height, weight, age, weight, body fat %,
amount of exercise, and activity level.

Here's a summary of my spreadsheet calculates my daily macro
consumption goals:

- **Fiber**: My minimum fiber goal is set to 14 grams per 1000
  calories consumed.  I hit my fiber goal daily (non-negotiable).

- **Netcarbs**: My maximum netcarbs is set to 20 grams.  This is a
  critical cornerstone of my health plan - the goal being to manage my
  insulin resistance and avoid large insulin spikes.  I stay below my
  netcarb goal daily (non-negotiable).

- **Protein**: Consuming less protein than you require will result in
  muscle loss which you certainly don't want.  Consuming more protein
  than you require raises insulin levels which you are also trying to
  avoid.  To dial in the proper amount I use a formula where my daily
  protein requirement is a function of grams of protein per kilograms
  of lean body mass (g/kg lbm).  I derive my lean body daily using my
  weight and body fat percentage.  I then determine the appropriate
  number of grams based on my current activity level using the
  following as a guide:

  - Sedentary (generally physically inactive): 0.5g per kg lbm
  - Light activity (includes walking or gardening): 0.6g per kg lbm
  - Moderate (30 minutes of moderate activity, thrice weekly): 0.7g per kg lbm
  - Active (one hour of exercise, five times weekly): 0.8g per kg lbm
  - Very active (10 to 20 hours of exercise weekly): 0.9g per kg lbm
  - Athlete (over 20 hours of exercise weekly): 1.0g per kg lbm

- **Fat**: The remaining calories I require come from the fat bucket.

Application of the above algorithm has resulted in a macro split
roughly as follows (which happens to align with various Keto dietary
models although I've built my from the ground up using first
principles):
- 75% of calories from fat
- 20% of calories from protein
- 5% of calories from netcarbs



## Hydration

Getting enough water per day is critical particularly if you are on a
low carb routine.  Failure will result in kidney stones!  I use the
formula of weight "divided by 2" ounces of water per day as the
minimum.



# Exercise

While I was really focused on losing weight and getting healthier I
logged a minimum of 12,000 steps per day.  I used that time typically
to listen to podcasts and books about nutrition and health.  If you
have the time in the day to do this, I can't recommend it enough.



# Sleep

I captured these details from a summary of Matt Walker's book on [fastlifehacks.com](fastlifehacks.com):

1. **Stick to a sleep schedule**: We should aim to go to bed and wake up at the same time each day. People generally have a hard time adjusting to changes in sleep patterns. Unfortunately sleeping late on weekends doesn’t make up for poor sleep during the week. If necessary, set an alarm for bedtime. Matthew emphasizes this is the #1 priority from the list; stick to a regular sleep schedule.
2. **Don’t exercise too late in the day**: Exercise is great, and we should try to exercise at least 30 minutes on most days. But try to time it no later than 2-3 hours before bed.
3. **Avoid caffeine & nicotine**: Colas, coffee, teas (that aren’t herbal) and chocolate contain caffeine, which is a stimulant. Even consuming these in the afternoon can have an effect on your sleep. Nicotine is also a mild stimulant, and smokers will often wake up earlier than they would otherwise, due to nicotine withdrawal.
4. **Avoid alcoholic drinks before bed**: The presence of alcohol in the body can reduce your REM sleep, keeping you in the lighter stages of sleep.
5. **Avoid large meals and beverages late at night**: A light snack before bed is okay, but a heavy meal can cause digestive issues, which interferes with sleep. Drinking too many fluids can cause freuqent awakenings to urinate.
6. **Avoid medicines that delay or disrupt your sleep (where possible)**: Some commonly prescribed heart, blood pressure or asthma medications, as well as some over the counter and herbal medicines for coughs, colds, or allergies can disrupt sleep patterns. If you have trouble sleeping, it may be worth speaking to your doctor or pharmacist to see if any of the drugs you’re taking may be contributing to this. It may be possible to take them earlier in the day.
7. **Don’t nap after 3pm**: Naps are great, but taking them too late in the day can make it hard to fall asleep at night.
8. **Make sure to leave time to relax before bed**: It’s important to have time before bed to unwind. Try to schedule your days so that there is time to relax before bed.
9. **Take a hot bath before bed**: The drop in body temperature after a bath may help you to feel sleepy, and the bath can help you to slow down and relax before bed.
10. **Have a dark, cool (in temperature), gadget free bedroom**: We sleep better at night if the temperature in the room is kept on the cool side. Gadgets such as mobile phones and computers can be a distraction. Additionally the light they emit, especially the blue light, suppresses the secretion of melatonin. Melatonin being a hormone that regulates sleep/wake cycles – with it increasing in the evening to induce sleep. There are things we can do to reduce the blue light at night, including:
  - Using blue light filters on our phones & tablets. iOS 9.3 or later (iPhone 5S & iPad 2 onwards) has this built in – called Night Shift. On Android there are apps for this, a popular one being Twilight.
  - Using blue light filters on our computers. For MacOS & Windows f.lux is a popular solution. Windows 10 also has a built in “Night Light” function that offers similar functionality.
  - Using blue light filters on our home lighting system. A popular solution to this are Philips Hue bulbs, which connect wirelessly to your router, and can be programmed to reduce blue light during certain times of day. So for example, if your bedtime is 11pm, you can set the bulbs to reduce blue light from 10pm onwards… which will increase your melatonin level, preparing you for sleep.
  - A comfortable mattress and pillow can set you up for a good sleep. Those with insomnia will often watch the clock, turn it away from view so you don’t have to worry about the time while trying to sleep. Use these tips to optimize your sleeping space.
11. **Get the right sunlight exposure**: Sun exposure during the day helps us to regulate sleeping patterns. Try to get outside in the natural sunlight for at least 30 minutes per day.
12. **Don’t stay in bed if you (really) can’t sleep**: If you find yourself still in bed for more than 20 minutes, or you’re starting to get anxious in bed, get up and do something else until you feel sleepy. Anxiety whilst trying to sleep can make it harder to fall asleep.



# Mistakes

Here's a list of mistakes I REMEMBER making:

- **Hydration**: Carbohydrates apparently attract water molecules so
  the less you have in your system the less water is retained.  As a
  result, it's fairly easy (individual dependent of course) to
  generate kidney stones.  This happened to me.  Thus, I'm pretty
  religious now about my daily water consumption goals.

- **Weighing Food**: I learned that nutrition labels apply to the food
  before you cook it.  Chicken, Beef, etc, usually shrink by 25% when
  you cook them, so weighing after the fact is fine as long as you
  adjust.  The nutrition label of an avocado is based on the weight of
  the avocado including the peel and the seed.

- **Oxalates**: For a long while I was eating a lot of high oxalate
  leafy vegetables in my large salads (spinach & chard).

- **Stevia**: I was adding Stevia to my black tea for a while because
  it doesn't increase blood sugar levels, but what I learned later was
  that it does in fact increase insulin levels.
