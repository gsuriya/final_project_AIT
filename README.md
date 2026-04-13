# calorie tracker 🍔

## overview

a simple web app for tracking what you eat each day and how many calories it was. you can set a daily calorie goal and see if youre on track or not. theres also a chart that shows a breakdown of what you ate using chart.js

## features

- log food entries with name, calories, and date
- delete entries you dont want anymore
- set a calorie goal for any day
- home page shows your entries, goal vs actual, and a bar chart breakdown
- pick any date to see past entries

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

the app has 3 main pages:

1. **home page (/)** - shows food entries for a day in a table, the calorie goal if set, and a chart.js bar chart. theres a date picker to switch days
2. **add food (/add)** - form to log a new food entry (name, calories, date)
3. **set goal (/goal)** - form to set or update a daily calorie goal

## site map

```
/ (home - view entries + chart)
├── /add (form to add food entry)
└── /goal (form to set daily goal)
```

## user stories

- as a user, i want to log what i ate so i can keep track of my calories
- as a user, i want to set a daily calorie goal so i know how much i should eat
- as a user, i want to see a chart of my meals so i can visually see where my calories came from
- as a user, i want to delete a food entry in case i logged something wrong
- as a user, i want to pick different dates so i can look at past days

## research topics

- **(3 points) Chart.js** - client-side JavaScript library for rendering charts. using it to display a bar chart on the home page that shows calories per food entry for the selected day. reference: https://www.chartjs.org/docs/latest/

## how to run locally

```
npm install
npm start
```

needs a mongodb connection. set the `DSN` environment variable to your mongo connection string, or it defaults to `mongodb://localhost/calorie-tracker`

## deployed at

https://calorie-tracker-r2mc.onrender.com
