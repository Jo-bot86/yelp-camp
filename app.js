const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');

const PORT = 5000;

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,'Connection error: '));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.get('/campground', async (req, res) => {
  const camp = new Campground({ title: 'CampCity', description: 'cheap camp' });
  await camp.save();
  res.send(camp);
})

app.get('/', (req, res) => {
  res.render('home');
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT http://localhost:5000`);
});