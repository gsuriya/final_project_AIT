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

// es6 class for summarizing a days worth of food
// kinda overkill but we need to use classes so here we are
class DaySummary {
  constructor(entries, goal) {
    this.entries = entries;
    this.goal = goal;
    // use reduce to get total (higher order function)
    this.total = entries.reduce((sum, e) => sum + e.calories, 0);
  }

  isOverGoal() {
    if (!this.goal) return false;
    return this.total > this.goal;
  }

  getRemaining() {
    if (!this.goal) return 0;
    return Math.max(0, this.goal - this.total);
  }

  getOverBy() {
    if (!this.goal) return 0;
    return Math.max(0, this.total - this.goal);
  }

  // filter entries above a certain calorie threshold
  // another higher order function usage
  getHighCalEntries(threshold) {
    return this.entries.filter(e => e.calories > threshold);
  }
}

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

    // grab the goal for this day if there is one
    const goalDoc = await DailyGoal.findOne({ date: dateFilter });
    const goal = goalDoc ? goalDoc.calorieGoal : null;

    // use the DaySummary class to do the math stuff
    const summary = new DaySummary(entries, goal);

    // need to pass chart data as json strings so handlebars doesnt freak out
    // map is a higher order function too btw
    const chartLabels = JSON.stringify(entries.map(e => e.food));
    const chartData = JSON.stringify(entries.map(e => e.calories));

    res.render('index', {
      entries,
      total: summary.total,
      date: dateFilter,
      goal,
      chartLabels,
      chartData,
      overGoal: summary.isOverGoal(),
      overBy: summary.getOverBy(),
      remaining: summary.getRemaining()
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
  if (cal > 10000) {
    return res.render('add', { error: 'bro thats way too many calories lol max is 10000', today: date || '' });
  }

  // sanitize the food name so no one injects html or whatever
  // also trim to 100 chars cuz no food name needs to be longer than that
  let cleanFood = food.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  cleanFood = cleanFood.trim().substring(0, 100);

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
  if (goalNum > 20000) {
    return res.render('goal', { error: 'thats... a lot. max is 20000', today: date || '' });
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
