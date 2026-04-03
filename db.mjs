import mongoose from 'mongoose';

// connecting to mongo... using DSN from env or just localhost for dev
// had to look up how to do this lol
mongoose.connect(process.env.DSN || 'mongodb://localhost/calorie-tracker');

// schema for each food entry a user logs
// like "ate a burrito, 500 cals" etc
const FoodEntrySchema = new mongoose.Schema({
  food: {type: String, required: true},
  calories: {type: Number, required: true, min: 0},
  // just storing date as a string cuz its easier to filter by day
  // might change this later idk
  date: {type: String, required: true},
  createdAt: {type: Date, default: Date.now}
});

// schema for setting a calorie goal for a specific day
// like "i wanna eat 2000 cals today"
const DailyGoalSchema = new mongoose.Schema({
  date: {type: String, required: true},
  calorieGoal: {type: Number, required: true, min: 0}
});

const FoodEntry = mongoose.model('FoodEntry', FoodEntrySchema);
const DailyGoal = mongoose.model('DailyGoal', DailyGoalSchema);

export { FoodEntry, DailyGoal };
