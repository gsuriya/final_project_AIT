# Milestone 03

## Repository Link

[https://github.com/gsuriya/final_project_AIT](https://github.com/gsuriya/final_project_AIT)

## URL for form 1 (from previous milestone) 

[https://calorie-tracker-r2mc.onrender.com/add](https://calorie-tracker-r2mc.onrender.com/add)

## Special Instructions for Form 1

fill in food name, calories, and a date then hit add entry. youll get redirected to the home page where you can see the entry you just added. you can also delete entries from there

## URL for form 2 (for current milestone)

[https://calorie-tracker-r2mc.onrender.com/goal](https://calorie-tracker-r2mc.onrender.com/goal)

## Special Instructions for Form 2

pick a date, type in how many calories you wanna eat that day, and hit save goal. then go to the home page and pick that same date to see your goal vs what you actually ate. if you already set a goal for that day it just updates it

## URL(s) to github repository with commits that show progress on research

Research topic: Chart.js (client-side JavaScript library, 3 points)

- chart rendering with real data from db: [https://github.com/gsuriya/final_project_AIT/blob/main/views/index.hbs#L48-L91](https://github.com/gsuriya/final_project_AIT/blob/main/views/index.hbs#L48-L91)
- chart.js CDN include: [https://github.com/gsuriya/final_project_AIT/blob/main/views/layout.hbs#L55](https://github.com/gsuriya/final_project_AIT/blob/main/views/layout.hbs#L55)
- passing chart data as JSON from route: [https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L68-L69](https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L68-L69)

Also used:

- ES6 class (DaySummary) for calorie calculations: [https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L20-L48](https://github.com/gsuriya/final_project_AIT/blob/main/app.mjs#L20-L48)
- Higher order functions (reduce, map, filter) throughout app.mjs

## References 

- chart.js getting started: [https://www.chartjs.org/docs/latest/getting-started/](https://www.chartjs.org/docs/latest/getting-started/)
- chart.js bar chart docs: [https://www.chartjs.org/docs/latest/charts/bar.html](https://www.chartjs.org/docs/latest/charts/bar.html)
- mongoose findOneAndUpdate for upsert pattern: [https://mongoosejs.com/docs/tutorials/findoneandupdate.html](https://mongoosejs.com/docs/tutorials/findoneandupdate.html)
- express handlebars setup based on class notes and homework