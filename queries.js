const { default: weaviate } = require('weaviate-ts-client');
require('dotenv').config();

const client = weaviate.client({
    scheme: 'https',
    host: process.env.WEAVIATE_URL,  // Replace with your endpoint
    apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),// Replace w/ your Weaviate instance API key  
    headers: { 'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY },
});

let num_movies = 20;


//Query to fetch keyword results
async function get_keyword_results(text) {

    let _text = text
    if (!text) {
        _text = "Movie"
    }

    let data = await client.graphql
        .get()
        .withClassName('Movies')
        .withBm25({
            query: _text,
            properties: ['title^3', 'director', 'genres', 'actors', 'keywords', 'description', 'plot'],
        })
        .withFields(['title', 'poster_link', 'genres', 'year', 'director', 'movie_id'])
        .withLimit(num_movies)
        .do()
        .then(info => {
            return info
        })
        .catch(err => {
            console.error(err)
        })
    return data;
}

//Query to fetch results by sematic searching
async function get_semantic_results(text) {
    if (text.length === 0) {
        let data = await client.graphql
            .get()
            .withClassName('Movies')
            .withFields(['title', 'poster_link', 'genres', 'year', 'director', 'movie_id'])
            .withLimit(num_movies)
            .do()
            .then(info => {
                return info
            })
            .catch(err => {
                console.error(err)
            });
        return data;
    } else {
        let data = await client.graphql
            .get()
            .withClassName('Movies')
            .withFields(['title', 'poster_link', 'genres', 'year', 'director', 'movie_id'])
            .withNearText({ concepts: [text] })
            .withLimit(num_movies)
            .do()
            .then(info => {
                return info
            })
            .catch(err => {
                console.error(err)
            });
        return data;
    }

}

//Query to fetch results by sematic searching
async function get_hybrid_results(text) {
    if (text.length === 0) {
        let data = await client.graphql
            .get()
            .withClassName('Movies')
            .withFields(['title', 'poster_link', 'genres', 'year', 'director', 'movie_id'])
            .withLimit(num_movies)
            .do()
            .then(info => {
                return info
            })
            .catch(err => {
                console.error(err)
            });
        return data;
    } else {
        let data = await client.graphql
            .get()
            .withClassName('Movies')
            .withFields(['title', 'poster_link', 'genres', 'year', 'director', 'movie_id'])
            .withHybrid({ query: text, alpha: 0.5 })
            .withLimit(num_movies)
            .do()
            .then(info => {
                return info
            })
            .catch(err => {
                console.error(err)
            });
        return data;
    }


}

//Query to fetch movie details
async function get_movie_details(id) {
    let data = await client.graphql
        .get()
        .withClassName('Movies')
        .withFields(['title', 'poster_link', 'description', 'year', 'director', 'actors', 'genres', 'keywords', 'movie_id', '_additional { id certainty }'])
        .withWhere({
            path: ["movie_id"],
            operator: "Equal",
            valueNumber: parseInt(id)
        })
        .do()
        .then(info => {
            return info;
        })
        .catch(err => {
            console.error(err)
        })
    return data;
}

//Query to fetch recommended movies
async function get_recommended_movies(mov_id) {
    let data = await client.graphql
        .get()
        .withClassName('Movies')
        .withFields(['title', 'genres', 'year', 'poster_link', 'movie_id'])
        .withNearObject({ id: mov_id })
        .withLimit(num_movies + 1)
        .do()
        .then(info => {
            return info;
        })
        .catch(err => {
            console.error(err)
        });
    return data;
}

//Exporting these function as they need to be used in index.js
module.exports = { get_keyword_results, get_semantic_results, get_hybrid_results, get_movie_details, get_recommended_movies }