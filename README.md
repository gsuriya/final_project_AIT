# calorie tracker 🍔

## overview

a simple web app for tracking what you eat each day and how many calories it was. you can set a daily calorie goal and see if youre on track or not. theres also a chart that shows a breakdown of what you ate using chart.js. theres also a search feature that looks up calories from the open food facts database so you dont have to guess

## features

- log food entries with name, calories, and date
- edit entries if you messed something up
- delete entries you dont want anymore
- set a calorie goal for any day
- home page shows your entries, goal vs actual, and a bar chart breakdown
- pick any date to see past entries
- search for foods when adding an entry and it auto fills the calories for you

## data model

two mongoose schemas:

**FoodEntry** - each individual food item you log
- food (String, required) - what you ate
- calories (Number, required, min 0) - how many cals
- date (String, required) - which day, stored as YYYY-MM-DD
- createdAt (Date) - when the entry was created

**DailyGoal** - a calorie goal for a specific day
- date (String, required) - which day
- calorieGoal (Number, required, min 0) - how many cals youre trying to eat

## wireframes

the app has 4 main pages:

1. **home page (/)** - shows food entries for a day in a table, the calorie goal if set, and a chart.js bar chart. theres a date picker to switch days. each entry has edit and delete buttons
2. **add food (/add)** - form to log a new food entry, has a search thing that looks up calories from open food facts
3. **set goal (/goal)** - form to set or update a daily calorie goal
4. **edit entry (/edit/:id)** - form to change an existing food entry

## site map

```
/ (home - view entries + chart)
├── /add (add food, with calorie search)
├── /goal (set daily goal)
├── /edit/:id (edit an entry)
└── /api/search?q=... (food search api, proxies open food facts)
```

## user stories

- as a user, i want to log what i ate so i can keep track of my calories
- as a user, i want to set a daily calorie goal so i know how much i should eat
- as a user, i want to see a chart of my meals so i can visually see where my calories came from
- as a user, i want to delete a food entry in case i logged something wrong
- as a user, i want to edit a food entry if i need to fix the calories or name
- as a user, i want to pick different dates so i can look at past days
- as a user, i want to search for food items so i dont have to guess calories

## research topics

- **(3 points) Chart.js** - client-side JavaScript library for rendering charts. using it to display a bar chart on the home page that shows calories per food entry for the selected day. reference: https://www.chartjs.org/docs/latest/
- **(2 points) Bootstrap 5** - css framework. using it for layout, nav, forms, tables, buttons etc. customized the colors to be green instead of default blue cuz its a health app. reference: https://getbootstrap.com/docs/5.3/
- **(2 points) express-validator** - server-side library for validating form inputs in express. using it as middleware on all the post routes instead of writing a bunch of if/else checks manually. reference: https://express-validator.github.io/docs/
- **(3 points) Open Food Facts API** - external api for looking up nutrition info. set up a proxy route on the server (/api/search) that uses axios to call open food facts, then the add food page uses fetch to show search results as you type. reference: https://wiki.openfoodfacts.org/API

10 points total

## how to run locally

```
npm install
npm start
```

needs a mongodb connection. set the `DSN` environment variable to your mongo connection string, or it defaults to `mongodb://localhost/calorie-tracker`

## deployed at

https://calorie-tracker-r2mc.onrender.com
