import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/foodlink').then(async () => {
  const foods = await mongoose.connection.db.collection('foods').find().sort({_id: -1}).limit(2).toArray();
  console.log(JSON.stringify(foods, null, 2));
  process.exit(0);
});
