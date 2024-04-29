import weaviate
import pandas as pd
import os
from tqdm import tqdm

openai_key = os.environ.get("OPENAI_API_KEY", "")
weaviate_url = os.environ.get("WEAVIATE_URL", "")
weaviate_key = os.environ.get("WEAVIATE_API_KEY", "")

auth_config = weaviate.AuthApiKey(api_key=weaviate_key)

# Setting up client
client = weaviate.Client(
    url = weaviate_url,
    auth_client_secret=auth_config,
    additional_headers={
         "X-OpenAI-Api-Key": openai_key, # Replace with your OpenAI key
    }
    )

# Load and prepare dataset
df=pd.read_csv("./data/movie_data.csv", 
               usecols = ['id', 'Name', 'PosterLink', 'Genres', 'Actors', 
                          'Director','Description', 'DatePublished', 'Keywords'], 
               parse_dates = ["DatePublished"])
df["year"] = df["DatePublished"].dt.year.fillna(0).astype(int)
df.drop(["DatePublished"], axis=1, inplace=True)
df = df[df.year > 1970]

# Plot dataset
plots = pd.read_csv('./data/wiki_movie_plots_deduped.csv')
plots = plots[plots['Release Year'] > 1970]
plots = plots[plots.duplicated(subset=['Title', 'Release Year', 'Plot']) == False]
plots = plots[plots.duplicated(subset=['Title', 'Release Year']) == False]
plots = plots[['Title', 'Plot', 'Release Year']]

plots.columns = ['Name', 'Plot', 'year']

# Merge
df = df.merge(plots, on=['Name', 'year'], how='left').fillna('')
df.reset_index(drop=True, inplace=True)

collection_name = 'Awesome_moviate_movies'

#Checking if Movies schema already exists, then delete it
current_schemas = client.schema.get()['classes']
for schema in current_schemas:
    if schema['class']==collection_name:
        client.schema.delete_class(collection_name)

#creating the schema
movie_class_schema = {
    "class": collection_name,
    "description": "A collection of movies since 1970.",
    "vectorizer": "text2vec-openai",
    "vectorIndexConfig" : {
        "distance" : "cosine",
    },
    "moduleConfig": {
        "text2vec-openai": {
            "vectorizeClassName": False,
            "model": "ada",
            "modelVersion": "002",
            "type": "text"
        },
    },
}

movie_class_schema["properties"] = [
        {
            "name": "movie_id",
            "dataType": ["number"],
            "description": "The id of the movie", 
            "moduleConfig": {
                "text2vec-openai": {  
                    "skip" : True,
                    "vectorizePropertyName" : False
                }
            }        
        },
        {
            "name": "title",
            "dataType": ["text"],
            "description": "The name of the movie", 
            "moduleConfig": {
                "text2vec-openai": {  
                    "skip" : True,
                    "vectorizePropertyName" : False
                }
            }   
        },
        {
            "name": "year",
            "dataType": ["number"],
            "description": "The year in which movie was published", 
            "moduleConfig": {
                "text2vec-openai": {  
                    "skip" : True,
                    "vectorizePropertyName" : False
                }
            }   
        },
        {
            "name": "poster_link",
            "dataType": ["text"],
            "description": "The poster link of the movie", 
            "moduleConfig": {
                "text2vec-openai": {  
                    "skip" : True,
                    "vectorizePropertyName" : False
                }
            }   
        },
        {
            "name": "genres",
            "dataType": ["text"],
            "description": "The genres of the movie",
            "moduleConfig": {
                "text2vec-openai": {  
                    "skip" : True,
                    "vectorizePropertyName" : False
                }
            }
        },
        {
            "name": "actors",
            "dataType": ["text"],
            "description": "The actors of the movie", 
            "moduleConfig": {
                "text2vec-openai": {  
                    "skip" : True,
                    "vectorizePropertyName" : False
                }
            }   
        },
        {
            "name": "director",
            "dataType": ["text"],
            "description": "Director of the movie",
            "moduleConfig": {
                "text2vec-openai": {  
                    "skip" : True,
                    "vectorizePropertyName" : False
                }
            }
        },
        {
            "name": "description",
            "dataType": ["text"],
            "description": "overview of the movie", 
        },
        {
            "name": "Plot",
            "dataType": ["text"],
            "description": "Plot of the movie from Wikipedia", 
        },
        {
            "name": "keywords",
            "dataType": ["text"],
            "description": "main keywords of the movie", 
        },
    ]
client.schema.create_class(movie_class_schema)

# Configure batch process - for faster imports 
client.batch.configure(
  batch_size=10, 
  dynamic=True,   # dynamically update the `batch_size` based on import speed
  timeout_retries=3,
)


# Importing the data
for i in tqdm(range(len(df))):
    item = df.iloc[i]

    movie_object = {
        'movie_id':float(item['id']),
        'title': str(item['Name']).lower(),
        'year': int(item['year']),
        'poster_link': str(item['PosterLink']),
        'genres':str(item['Genres']),
        'actors': str(item['Actors']).lower(),
        'director': str(item['Director']).lower(),
        'description':str(item['Description']),
        'plot': str(item['Plot']),
        'keywords': str(item['Keywords']),
    }

    try:
        client.batch.add_data_object(movie_object, collection_name)
    except BaseException as error:
        print("Import Failed at: ",i)
        print("An exception occurred: {}".format(error))
        # Stop the import on error
        break

print(client.query.aggregate(collection_name).with_meta_count().do())
client.batch.flush()