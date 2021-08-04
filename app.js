const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utilities/ExpressError');
const catchAsync = require('./utilities/catchAsync');
const {campgroundSchema, reviewSchema} = require('./schemas.js');

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

const validateCampground = (req, res, next) => {
  const {error} = campgroundSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400)
  } else{
    next(error);
  }
}

const validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next(error);
  }
}
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/campgrounds', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', {campgrounds});
}));

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/edit', {campground});
}));

app.get('/campgrounds/:id/delete', catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/delete', {campground});
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}));

app.put('/campgrounds/:id',validateCampground ,catchAsync(async (req, res) => {
  const {id} = req.params;
  const editedCampground = req.body.campground;
  console.log(id);
  await Campground.findByIdAndUpdate(id, editedCampground);
  res.redirect(`/campgrounds/${id}`); 
}));

app.post('/campgrounds',validateCampground ,catchAsync(async (req, res) => {
    if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const c = req.body.campground;
    const newCampground = new Campground(c);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
})); 

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id).populate('reviews');
  res.render('campgrounds/show', {campground});
}));

app.post('/campgrounds/:id/reviews', validateReview ,catchAsync(async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${id}`)
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
  const {id, reviewId} = req.params;
  await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}})
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
}))

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { status = 500} = err;
  if(!err.message) err.message ="Something went wrong";
  res.status(status).render('error', {err});
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT http://localhost:5000`);
});