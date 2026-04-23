import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { body, validationResult } from 'express-validator';
import axios from 'axios';
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
// also need this for the api search route to work
app.use(express.json());
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

// another class for cleaning up the data we get back from open food facts
// their api returns a ton of junk so this just grabs the stuff we actually need
class FoodSearchResult {
  constructor(product) {
    this.name = (product.product_name || 'unknown').substring(0, 80);
    this.brand = product.brands || '';
    // the nutriments object has like 50 fields lol we only want kcal
    const nutriments = product.nutriments || {};
    this.calories = Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0);
  }

  toJSON() {
    const label = this.brand ? `${this.name} (${this.brand})` : this.name;
    return { name: label, calories: this.calories };
  }
}

// express-validator stuff
// way better than doing manual if/else for every single field lol
// learned about this from https://express-validator.github.io/docs/
const validateFood = [
  body('food')
    .trim()
    .notEmpty().withMessage('yo you gotta enter a food name')
    .isLength({ max: 100 }).withMessage('thats way too long, keep it under 100 chars')
    .escape(),
  body('calories')
    .notEmpty().withMessage('you forgot the calories')
    .isInt({ min: 0, max: 10000 }).withMessage('calories gotta be between 0 and 10000'),
  body('date')
    .notEmpty().withMessage('pick a date pls')
    .isISO8601().withMessage('something is wrong with that date')
];

const validateGoal = [
  body('date')
    .notEmpty().withMessage('pick a date pls')
    .isISO8601().withMessage('something is wrong with that date'),
  body('calorieGoal')
    .notEmpty().withMessage('you forgot to enter a goal')
    .isInt({ min: 0, max: 20000 }).withMessage('goal gotta be between 0 and 20000')
];

// ROUTES

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
// using express-validator middleware instead of manual checks now
app.post('/add', validateFood, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const today = req.body.date || new Date().toISOString().slice(0, 10);
    return res.render('add', { error: errors.array()[0].msg, today });
  }

  try {
    const { food, calories, date } = req.body;
    await FoodEntry.create({ food, calories: parseInt(calories), date });
    res.redirect('/?date=' + date);
  } catch(err) {
    console.log(err);
    res.render('add', { error: 'something went wrong saving that... try again?', today: req.body.date || '' });
  }
});

// edit page - basically the same as add but with pre-filled values
app.get('/edit/:id', async (req, res) => {
  try {
    const entry = await FoodEntry.findById(req.params.id);
    if (!entry) {
      return res.redirect('/');
    }
    res.render('edit', { entry });
  } catch(err) {
    console.log(err);
    res.redirect('/');
  }
});

// handle edit form submit
app.post('/edit/:id', validateFood, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // gotta re-fetch the entry so we can show the form again with the error
    try {
      const entry = await FoodEntry.findById(req.params.id);
      return res.render('edit', { entry, error: errors.array()[0].msg });
    } catch(e) {
      return res.redirect('/');
    }
  }

  try {
    const { food, calories, date } = req.body;
    await FoodEntry.findByIdAndUpdate(req.params.id, {
      food,
      calories: parseInt(calories),
      date
    });
    res.redirect('/?date=' + date);
  } catch(err) {
    console.log(err);
    res.redirect('/');
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
app.post('/goal', validateGoal, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('goal', { error: errors.array()[0].msg, today: req.body.date || '' });
  }

  const { date, calorieGoal } = req.body;
  const goalNum = parseInt(calorieGoal);

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

// api route that proxies to open food facts
// had to do this on the server side cuz the browser blocks cross origin requests
// uses axios to hit their search api, then we just grab the name + calories
// and send it back as json so the frontend can use fetch to get it
// api docs: https://wiki.openfoodfacts.org/API
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query || query.length < 2) {
    return res.json([]);
  }

  try {
    const response = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
      params: {
        search_terms: query,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 8,
        fields: 'product_name,brands,nutriments'
      },
      timeout: 5000
    });

    // filter out junk results and use the FoodSearchResult class to clean em up
    // also filter and map are both higher order functions btw
    const products = (response.data.products || [])
      .filter(p => p.product_name)
      .map(p => new FoodSearchResult(p))
      .filter(r => r.calories > 0)
      .map(r => r.toJSON());

    res.json(products);
  } catch(err) {
    // if the api is down or whatever just return empty array
    // dont wanna crash the whole app over this lol
    console.log('food search api error:', err.message);
    res.json([]);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
