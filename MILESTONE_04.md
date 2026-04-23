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
Type a food name in the text field -- as you type, it searches the Open Food Facts database and shows calorie suggestions. Click a suggestion to auto-fill, or just type your own values. Fill in all fields and hit "add entry". You get redirected to the home page where your entry shows up in the table and chart.

URL for form 2 (for current milestone)
---
https://calorie-tracker-r2mc.onrender.com/goal

Special Instructions for Form 2
---
Pick a date, enter your calorie goal for that day, and hit "save goal". Go to the home page and select the same date to see the goal tracker showing your progress (remaining cals or how much you went over).

URL for form 3 (from previous milestone) 
---
https://calorie-tracker-r2mc.onrender.com (click the pencil icon next to any entry to edit it)

Special Instructions for Form 3
---
From the home page, click the pencil (edit) icon next to any food entry. This takes you to the edit form where you can change the food name, calories, or date. Hit "save changes" to update it.

First link to github line number(s) for constructor, HOF, etc.
---
https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L21-L50

Second link to github line number(s) for constructor, HOF, etc.
---
https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L53-L63

Short description for links above
---
DaySummary is an ES6 class that takes food entries and a goal, uses reduce (HOF) to compute total calories, and has methods including filter (HOF) for finding high-calorie entries. FoodSearchResult is a second ES6 class that takes raw Open Food Facts API product data and formats it into a clean object with a toJSON method. Additionally, map (HOF) is used throughout app.mjs to transform entries into chart labels/data arrays.

Link to github line number(s) for schemas (db.js or models folder)
---
https://github.com/gsuriya/final_project_AIT/blob/main/db.mjs#L9-L23

Description of research topics above with points
---
3 points - Chart.js: client-side charting library used to render a bar chart on the home page showing calorie breakdown per food entry
2 points - Bootstrap 5: CSS framework with a custom green health-themed color scheme applied to the navbar, buttons, forms, tables, and alerts
2 points - express-validator: server-side validation middleware for Express, used to validate all form inputs (food name, calories, date, goal) with reusable validation chains
3 points - Open Food Facts API: external nutrition API integrated through a server-side proxy route (/api/search) using axios; client-side uses fetch (AJAX) with debounced input to show real-time calorie suggestions as user types food names

Links to github line number(s) for research topics described above (one link per line)
---
Chart.js rendering: https://github.com/gsuriya/final_project_AIT/blob/main/views/index.hbs#L56-L102
Chart.js CDN include: https://github.com/gsuriya/final_project_AIT/blob/main/views/layout.hbs#L69
Bootstrap CDN + custom theme: https://github.com/gsuriya/final_project_AIT/blob/main/views/layout.hbs#L10-L66
express-validator middleware: https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L70-L88
express-validator usage in routes: https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L113-L118
Open Food Facts API proxy route (server-side, axios): https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L197-L224
AJAX calorie search (client-side, fetch): https://github.com/gsuriya/final_project_AIT/blob/main/views/add.hbs#L29-L75

Optional project notes 
--- 
The calorie search feature requires an internet connection since it calls the Open Food Facts API. Search results may vary depending on what foods are in their database. The app works fine without the search -- you can always type in calories manually.

Attributions
---
Chart.js getting started: https://www.chartjs.org/docs/latest/getting-started/ (views/index.hbs chart setup)
Chart.js bar chart docs: https://www.chartjs.org/docs/latest/charts/bar.html (chart config options)
Bootstrap 5 docs: https://getbootstrap.com/docs/5.3/ (layout and component classes)
express-validator docs: https://express-validator.github.io/docs/ (validation middleware pattern)
Open Food Facts API wiki: https://wiki.openfoodfacts.org/API (search endpoint params)
Mongoose findOneAndUpdate: https://mongoosejs.com/docs/tutorials/findoneandupdate.html (upsert pattern for goals)
Express Handlebars setup based on class notes and homework assignments
