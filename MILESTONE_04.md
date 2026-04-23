Milestone 04 - Final Project Documentation
===

NetID
---
(TODO: replace with your netid)

Name
---
(TODO: replace with your first and last name)

Repository Link
---
https://github.com/gsuriya/final_project_AIT

URL for deployed site 
---
https://calorie-tracker-r2mc.onrender.com

URL for form 1 (from previous milestone) 
---
https://calorie-tracker-r2mc.onrender.com/add

Special Instructions for Form 1
---
type a food name in the text box and it searches open food facts for calorie info. you can click one of the results to auto fill the calories, or just type in your own number. fill in everything and hit add entry, itll redirect to the home page where you can see it

URL for form 2 (for current milestone)
---
https://calorie-tracker-r2mc.onrender.com/goal

Special Instructions for Form 2
---
pick a date and enter how many cals you wanna eat that day, hit save. then go to the home page and pick the same date and youll see the goal tracker box thing showing if youre under or over

URL for form 3 (from previous milestone) 
---
https://calorie-tracker-r2mc.onrender.com (click the pencil icon next to any entry)

Special Instructions for Form 3
---
from the home page click the pencil edit button next to any food entry, it takes you to a form where you can change the food name or calories or date. hit save changes and it goes back to the home page

First link to github line number(s) for constructor, HOF, etc.
---
https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L26-L50

Second link to github line number(s) for constructor, HOF, etc.
---
https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L55-L67

Short description for links above
---
DaySummary is an es6 class that takes food entries and a calorie goal, uses reduce (hof) to get total calories, and filter (hof) for getting high calorie entries. FoodSearchResult is another es6 class that takes the raw product data from open food facts api and cleans it up into just the name and calories. map (hof) is also used in a bunch of places to turn entries into chart data arrays and to clean up api results

Link to github line number(s) for schemas (db.js or models folder)
---
https://github.com/gsuriya/final_project_AIT/blob/main/db.mjs#L9-L23

Description of research topics above with points
---
3 points - Chart.js: client-side charting library, using it for the bar chart on the home page that shows calorie breakdown per food entry
2 points - Bootstrap 5: css framework, applied it to the whole app and customized the default blue theme to green
2 points - express-validator: server-side validation library for express, using it as middleware to validate all the form inputs instead of manual if/else
3 points - Open Food Facts API: external api for nutrition info, set up a server-side proxy route with axios and the add food page uses fetch (ajax) to search and show results as you type

Links to github line number(s) for research topics described above (one link per line)
---
chart.js chart rendering: https://github.com/gsuriya/final_project_AIT/blob/main/views/index.hbs#L56-L102
chart.js cdn include: https://github.com/gsuriya/final_project_AIT/blob/main/views/layout.hbs#L65
bootstrap cdn + custom css: https://github.com/gsuriya/final_project_AIT/blob/main/views/layout.hbs#L9-L60
express-validator middleware: https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L72-L90
express-validator usage in post route: https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L123-L128
open food facts proxy route (axios): https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L199-L228
ajax calorie search (fetch): https://github.com/gsuriya/final_project_AIT/blob/main/views/add.hbs#L27-L79

Optional project notes 
--- 
the calorie search thing needs internet cuz it calls the open food facts api. results depend on whats in their database, some stuff might not show up. the app still works fine without it you can always just type in the calories yourself

Attributions
---
chart.js getting started guide - views/index.hbs chart setup: https://www.chartjs.org/docs/latest/getting-started/
chart.js bar chart docs - chart config: https://www.chartjs.org/docs/latest/charts/bar.html
bootstrap 5 docs - layout and components: https://getbootstrap.com/docs/5.3/
express-validator docs - validation middleware pattern: https://express-validator.github.io/docs/
open food facts api docs - search endpoint: https://wiki.openfoodfacts.org/API
mongoose findOneAndUpdate for upsert - goal route: https://mongoosejs.com/docs/tutorials/findoneandupdate.html
express handlebars setup based on class notes and homework
