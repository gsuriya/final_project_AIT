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

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// es6 class for summarizing a days worth of food
class DaySummary {
  constructor(entries, goal) {
    this.entries = entries;
    this.goal = goal;
    // higher order function: reduce to get total calories
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

  getHighCalEntries(threshold) {
    // higher order function: filter entries above a certain calorie threshold
    return this.entries.filter(e => e.calories > threshold);
  }
}

// es6 class for formatting search results from the Open Food Facts API
class FoodSearchResult {
  constructor(product) {
    this.name = (product.product_name || 'unknown').substring(0, 80);
    this.brand = product.brands || '';
    const nutriments = product.nutriments || {};
    this.calories = Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0);
  }

  toJSON() {
    const label = this.brand ? `${this.name} (${this.brand})` : this.name;
    return { name: label, calories: this.calories };
  }
}

// ==============================
// express-validator middleware arrays (research topic: 2 pts)
// reusable validation chains for POST routes
// reference: https://express-validator.github.io/docs/
// ==============================

const validateFoodEntry = [
  body('food')
    .trim()
    .notEmpty().withMessage('food name is required')
    .isLength({ max: 100 }).withMessage('food name is too long (max 100 chars)')
    .escape(),
  body('calories')
    .notEmpty().withMessage('calories is required')
    .isInt({ min: 0, max: 10000 }).withMessage('calories must be between 0 and 10000'),
  body('date')
    .notEmpty().withMessage('date is required')
    .isISO8601().withMessage('invalid date format')
];

const validateGoal = [
  body('date')
    .notEmpty().withMessage('date is required')
    .isISO8601().withMessage('invalid date format'),
  body('calorieGoal')
    .notEmpty().withMessage('calorie goal is required')
    .isInt({ min: 0, max: 20000 }).withMessage('goal must be between 0 and 20000')
];

// ==============================
// ROUTES
// ==============================

app.get('/', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const dateFilter = req.query.date || today;

  try {
    const entries = await FoodEntry.find({ date: dateFilter }).sort({ createdAt: -1 });
    const goalDoc = await DailyGoal.findOne({ date: dateFilter });
    const goal = goalDoc ? goalDoc.calorieGoal : null;

    const summary = new DaySummary(entries, goal);

    // higher order function: map to transform entries into chart-friendly arrays
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
    console.log(err);
    res.render('index', { entries: [], total: 0, date: dateFilter });
  }
});

app.get('/add', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  res.render('add', { today });
});

app.post('/add', validateFoodEntry, async (req, res) => {
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
    res.render('add', { error: 'something went wrong saving that', today: req.body.date || '' });
  }
});

// 3rd form: edit an existing food entry
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

app.post('/edit/:id', validateFoodEntry, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
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

app.post('/goal', validateGoal, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('goal', { error: errors.array()[0].msg, today: req.body.date || '' });
  }

  const { date, calorieGoal } = req.body;
  const goalNum = parseInt(calorieGoal);

  try {
    await DailyGoal.findOneAndUpdate(
      { date },
      { date, calorieGoal: goalNum },
      { upsert: true, new: true }
    );
    res.render('goal', {
      success: 'goal saved! go check the home page',
      today: date,
      currentGoal: goalNum
    });
  } catch(err) {
    console.log(err);
    res.render('goal', { error: 'couldnt save that goal', today: date || '' });
  }
});

app.post('/delete/:id', async (req, res) => {
  try {
    const entry = await FoodEntry.findByIdAndDelete(req.params.id);
    const date = entry ? entry.date : '';
    res.redirect('/?date=' + date);
  } catch(err) {
    console.log(err);
    res.redirect('/');
  }
});

// ==============================
// API route: proxy to Open Food Facts for calorie lookup (research topic: 3 pts)
// uses axios on server side to avoid CORS issues
// client-side fetch calls this endpoint (AJAX interaction)
// reference: https://wiki.openfoodfacts.org/API
// ==============================

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

    const products = (response.data.products || [])
      .filter(p => p.product_name)
      .map(p => new FoodSearchResult(p))
      .filter(r => r.calories > 0)
      .map(r => r.toJSON());

    res.json(products);
  } catch(err) {
    console.log('open food facts api error:', err.message);
    res.json([]);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
