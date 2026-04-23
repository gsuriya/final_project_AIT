# calorie tracker 🥗

## overview

a simple web app for tracking what you eat each day and how many calories it was. you can set a daily calorie goal and see if youre on track or not. theres also a chart that shows a breakdown of what you ate using chart.js. you can search for foods and auto-fill calorie info using the open food facts api

## features

- log food entries with name, calories, and date
- edit existing entries if you made a mistake
- delete entries you dont want anymore
- set a calorie goal for any day
- home page shows your entries, goal vs actual, and a bar chart breakdown
- pick any date to see past entries
- ajax-powered calorie lookup when adding food (searches open food facts database)
- input validation on all forms using express-validator

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
2. **add food (/add)** - form to log a new food entry with ajax calorie search powered by open food facts api
3. **set goal (/goal)** - form to set or update a daily calorie goal
4. **edit entry (/edit/:id)** - form to modify an existing food entry

## site map

```
/ (home - view entries + chart)
├── /add (form to add food entry, with ajax calorie lookup)
├── /goal (form to set daily goal)
├── /edit/:id (form to edit existing entry)
└── /api/search?q=... (json api for food search, proxies open food facts)
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
- **(2 points) Bootstrap 5** - CSS framework / UI toolkit. using it for the layout, navigation, forms, tables, and buttons with a custom green health-themed color scheme. reference: https://getbootstrap.com/docs/5.3/
- **(2 points) express-validator** - server-side validation library for Express. using it as middleware to validate all form inputs (food name length, calorie range, date format, goal range) instead of manual if/else checks. reference: https://express-validator.github.io/docs/
- **(3 points) Open Food Facts API** - external API for looking up nutritional information. integrated via a server-side proxy route (/api/search) that uses axios to call the open food facts search endpoint, then the client uses fetch (AJAX) to display results as the user types in the add food form. reference: https://wiki.openfoodfacts.org/API

10 points total

## how to run locally

```
npm install
npm start
```

needs a mongodb connection. set the `DSN` environment variable to your mongo connection string, or it defaults to `mongodb://localhost/calorie-tracker`

## deployed at

https://calorie-tracker-r2mc.onrender.com
