import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import './db.mjs';
import { FoodEntry, DailyGoal } from './db.mjs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// setup handlebars and stuff
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// need this to parse form data
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// ==============================
// ROUTES
// ==============================

// home page - shows all the food entries for a given day
app.get('/', async (req, res) => {
  // default to today if no date param
  const today = new Date().toISOString().slice(0, 10);
  const dateFilter = req.query.date || today;

  try {
    const entries = await FoodEntry.find({ date: dateFilter }).sort({ createdAt: -1 });

    // calc total cals for the day
    // using reduce here (higher order function!!)
    const total = entries.reduce((sum, entry) => sum + entry.calories, 0);

    // grab the goal for this day if there is one
    const goalDoc = await DailyGoal.findOne({ date: dateFilter });
    const goal = goalDoc ? goalDoc.calorieGoal : null;

    // need to pass chart data as json strings so handlebars doesnt freak out
    // map is a higher order function too btw
    const chartLabels = JSON.stringify(entries.map(e => e.food));
    const chartData = JSON.stringify(entries.map(e => e.calories));

    // figure out if theyre over or under their goal
    let overGoal = false;
    let overBy = 0;
    let remaining = 0;
    if (goal) {
      if (total > goal) {
        overGoal = true;
        overBy = total - goal;
      } else {
        remaining = goal - total;
      }
    }

    res.render('index', {
      entries, total, date: dateFilter,
      goal, chartLabels, chartData,
      overGoal, overBy, remaining
    });
  } catch(err) {
    // lol hopefully this never happens
    console.log(err);
    res.render('index', { entries: [], total: 0, date: dateFilter });
  }
});

// page with the form to add a new food entry
app.get('/add', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  res.render('add', { today });
});

// handle the form submission for adding food
app.post('/add', async (req, res) => {
  const { food, calories, date } = req.body;

  // basic validation so the app doesnt blow up
  if (!food || !calories || !date) {
    return res.render('add', { error: 'yo you gotta fill in all the fields', today: date || '' });
  }

  const cal = parseInt(calories);
  if (isNaN(cal) || cal < 0) {
    return res.render('add', { error: 'calories has to be a number thats 0 or more', today: date || '' });
  }

  // sanitize the food name so no one injects html or whatever
  // just using a simple replace to strip tags for now
  const cleanFood = food.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  try {
    await FoodEntry.create({ food: cleanFood, calories: cal, date });
    res.redirect('/?date=' + date);
  } catch(err) {
    console.log(err);
    res.render('add', { error: 'something went wrong saving that... try again?', today: date || '' });
  }
});

// page to set a calorie goal for a day
app.get('/goal', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const dateForGoal = req.query.date || today;

  try {
    const existing = await DailyGoal.findOne({ date: dateForGoal });
    res.render('goal', {
      today: dateForGoal,
      currentGoal: existing ? existing.calorieGoal : ''
    });
  } catch(err) {
    console.log(err);
    res.render('goal', { today: dateForGoal });
  }
});

// handle goal form submit
// uses findOneAndUpdate so it overwrites if theres already a goal for that day
app.post('/goal', async (req, res) => {
  const { date, calorieGoal } = req.body;

  if (!date || !calorieGoal) {
    return res.render('goal', { error: 'fill in both fields pls', today: date || '' });
  }

  const goalNum = parseInt(calorieGoal);
  if (isNaN(goalNum) || goalNum < 0) {
    return res.render('goal', { error: 'goal has to be a positive number dude', today: date || '' });
  }

  try {
    // upsert - create if doesnt exist, update if it does
    await DailyGoal.findOneAndUpdate(
      { date: date },
      { date: date, calorieGoal: goalNum },
      { upsert: true, new: true }
    );
    res.render('goal', {
      success: 'goal saved! go check the home page',
      today: date,
      currentGoal: goalNum
    });
  } catch(err) {
    console.log(err);
    res.render('goal', { error: 'couldnt save that, idk why', today: date || '' });
  }
});

// delete a food entry
app.post('/delete/:id', async (req, res) => {
  try {
    const entry = await FoodEntry.findByIdAndDelete(req.params.id);
    // redirect back to the same day so user doesnt lose context
    const date = entry ? entry.date : '';
    res.redirect('/?date=' + date);
  } catch(err) {
    console.log(err);
    res.redirect('/');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
