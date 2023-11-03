//importing required library
const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser');
const { default: weaviate } = require('weaviate-ts-client');
const e = require('express');
require('dotenv').config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));
let initial_path = path.join(__dirname, "views");

//Importing query functions from query.js
let { get_filtered_results, get_semantic_results, get_movie_details, get_recommended_movies } = require('./queries')


const client = weaviate.client({
    scheme: 'https',
    host: process.env.WEAVIATE_URL,  // Replace with your endpoint
    apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY), // Replace w/ your Weaviate instance API key  
    headers: { 'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY}, 
});

// variable storing the searched text
let text = "";
// variable storing ID of the movie being viewed
let id = "";
// variable storing if the searched text is for filter searching or Semantic Searching
let isSemantic = false;


//rendering home page
app.get('/', (req, res) => {
  res.render(path.join(initial_path, "search.ejs"), { movie_info: {} });
})


//perform query for seached text
app.get('/search', (req, res) => {
  // stores the searched text in variable "text"
  text = req.query['searched_data'].toLowerCase();

  if (req.query['filter_search'] != undefined) {
    isSemantic = false;
  }
  else {
    isSemantic = true;
  }
  // making a search query to search for the text on fields title,director,genres,keywords,actors 
  if (!isSemantic) {
    let get_results = get_filtered_results(text);
    get_results.then(results => { res.render(path.join(initial_path, "search.ejs"), { movie_info: results.data.Get.Movies }) });
  }
  else {
    let get_results = get_semantic_results(text);
    get_results.then(results => { res.render(path.join(initial_path, "search.ejs"), { movie_info: results.data.Get.Movies }) });
  }
})

app.get('/movie/:id', (req, res) => {

  // stores the ID of the movie that is being viewed in in variable "id"
  id = req.params.id

  //retrieving information of the movie with the given id
  let movie_info = get_movie_details(id);
    movie_info.then(info1 => {
    let recommended_movies = get_recommended_movies(info1.data.Get.Movies[0]._additional.id)
    recommended_movies.then(info2 => {
      res.render(path.join(initial_path, "movie_info.ejs"), { movie_info: info1.data.Get.Movies, related_movies: info2.data.Get.Movies });
    })
  })
})


app.listen(process.env.PORT || 3000,
  () => console.log(`The app is running on: http://localhost:${process.env.PORT || 3000}`)
)