const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
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

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', {campgrounds});
});

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.get('/campgrounds/:id/edit', async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/edit', {campground});
});

app.get('/campgrounds/:id/delete', async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/delete', {campground})
});

app.delete('/campgrounds/:id', async (req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds')
});

app.put('/campgrounds/:id', async (req, res) => {
  const {id} = req.params;
  const editedCampground = req.body.campground;
  console.log(id);
  await Campground.findByIdAndUpdate(id, editedCampground);
  res.redirect(`/campgrounds/${id}`); 
});

app.post('/campgrounds', async (req, res) => {
  const c = req.body.campground;
  const newCampground = new Campground(c);
  await newCampground.save();
  res.redirect(`/campgrounds/${newCampground._id}`);
}); 

app.get('/campgrounds/:id', async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/show', {campground});
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT http://localhost:5000`);
});