# Movie Search Engine

This is a demo of a movie search engine. This project is inspired by [Andrej Karpathy's weekend hack](https://twitter.com/karpathy/status/1647372603907280896) and is forked from this old project [weaviate/weaviate-examples/movies-search-engine](https://github.com/weaviate/weaviate-examples/tree/main/movies-search-engine).

[![Weaviate](https://img.shields.io/static/v1?label=powered%20by&message=Weaviate%20%E2%9D%A4&color=green&style=flat-square)](https://weaviate.io/) 
 [![Docker support](https://img.shields.io/badge/Docker_support-%E2%9C%93-4c1?style=flat-square&logo=docker&logoColor=white)](https://docs.docker.com/get-started/) [![Demo](https://img.shields.io/badge/Check%20out%20the%20demo!-yellow?&style=flat-square&logo=react&logoColor=white)](https://awesome-moviate.weaviate.io/)


This project allows three types of searches over movies: keyword-based (BM25), semantic, and hybrid searches. Additionally, it retrieves similar movies to a selected one.

## Prerequisites
* Docker
* Python
* Set the environment variables for your $OPENAI_API_KEY, $WEAVIATE_API_KEY, and $WEAVIATE_URL. If you are running Weaviate via Docker, the WEAVIATE_URL is "http://localhost:8080" and no WEAVIATE_API_KEY is needed.

## Setup instructions

Follow the following steps to reproduce the example 
1. Setup a virtual environment
```bash
python -m venv .venv             
source .venv/bin/activate
``` 

2. Set your OPENAI_API_KEY in the docker-compose.yml file and  run the following command to run the weaviate docker file 
```bash
docker compose up -d
``` 

3. Run the following command in directory to install all required dependencies 
```bash
pip install -r requirements.txt
``` 

4. Run the following command to add all the data objects,you can change path of dataset at line 115 if necessary. You can also decrease the number of data objects at line 119 so that it takes less time.
```bash
python add_data.py
``` 
5. After adding data run the following command to install all required node modules.
```bash
npm install
``` 
6. After adding data and installing modules run the following command and navigate to http://localhost:3000/ to perform searching
```bash
npm run start
```     

## Large Language Model (LLM) Costs

This project utilizes OpenAI models. Be advised that the usage costs for these models will be billed to the API access key you provide. Primarily, costs are incurred during data embedding. The default vectorization engine for this project is `Ada v2`.

## Project Architecture
This project is built on three primary components:

- Weaviate Database: You have the option to host on Weaviate Cloud Service (WCS) or run it locally.
- Frontend: HTML,CSS,Js
- Backend: NodeJs

## Dataset

* [48,000+ movies dataset](https://www.kaggle.com/datasets/yashgupta24/48000-movies-dataset) (License: CC0: Public Domain) for the columns: 'Id', 'Name', 'PosterLink', 'Genres', 'Actors', 'Director', 'Description', 'DatePublished', and 'Keywords'
* [Wikipedia Movie Plots](https://www.kaggle.com/datasets/jrobischon/wikipedia-movie-plots) (License: CC BY-SA 4.0), for the column 'Plot'

## Open Source Contributions

Your contributions are always welcome! Feel free to contribute ideas, feedback, or create issues and bug reports if you find any! Visit our [Weaviate Community Forum](https://forum.weaviate.io/) if you need any help!