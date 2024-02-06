from datetime import datetime, timedelta
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import random, json, os, re, boto3

# Function to generate a random datetime between two dates
def random_date(start_date, end_date):
    time_delta = end_date - start_date
    random_days = random.randint(0, time_delta.days)
    return start_date + timedelta(days=random_days)

def get_private_endpoint_srv(mongodb_uri, username, password):
    """
    Get the private endpoint SRV address from the given MongoDB URI.
    e.g. `mongodb+srv://my-cluster.mzvjf.mongodb.net` will be converted to 
    `mongodb+srv://<username>:<password>@my-cluster-pl-0.mzvjf.mongodb.net/?retryWrites=true&w=majority`
    """
    match = re.match(r"mongodb\+srv://(.+)\.(.+).mongodb.net", mongodb_uri)
    if match:
        return "mongodb+srv://{}:{}@{}-pl-0.{}.mongodb.net/?retryWrites=true&w=majority".format(username, password, match.group(1), match.group(2))
    else:
        raise ValueError("Invalid MongoDB URI: {}".format(mongodb_uri))

def get_public_endpoint_srv(mongodb_uri, username, password):
    """
    Get the private endpoint SRV address from the given MongoDB URI.
    e.g. `mongodb+srv://my-cluster.mzvjf.mongodb.net` will be converted to 
    `mongodb+srv://<username>:<password>@my-cluster.mzvjf.mongodb.net/?retryWrites=true&w=majority`
    """
    match = re.match(r"mongodb\+srv://(.+)\.(.+).mongodb.net", mongodb_uri)
    if match:
        return "mongodb+srv://{}:{}@{}.{}.mongodb.net/?retryWrites=true&w=majority".format(username, password, match.group(1), match.group(2))
    else:
        raise ValueError("Invalid MongoDB URI: {}".format(mongodb_uri))


def handler(event, context):
  client = boto3.client('secretsmanager')
  conn_string_srv = os.environ.get('CONN_STRING_STANDARD')
  secretId = os.environ.get('DB_USER_SECRET_ARN')
  json_secret = json.loads(client.get_secret_value(SecretId=secretId).get('SecretString'))
  username = json_secret.get('username')
  password = json_secret.get('password')
#   conn_string_private = get_private_endpoint_srv(conn_string_srv, username, password)
  conn_string = get_public_endpoint_srv(conn_string_srv, username, password)
  print('conn_string=', conn_string)

  client = MongoClient(conn_string, server_api=ServerApi('1'))

  # Select the database to use.
  db = client['mongodbVSCodePlaygroundDB']

  # Create 20 sample entries with dates spread between 2021 and 2023.
  entries = []

  for _ in range(20):
      item = random.choice(['abc', 'jkl', 'xyz', 'def'])
      price = random.randint(5, 30)
      quantity = random.randint(1, 20)
      date = random_date(datetime(2021, 1, 1), datetime(2023, 12, 31))
      entries.append({
          'item': item,
          'price': price,
          'quantity': quantity,
          'date': date
      })

  # Insert a few documents into the sales collection.
  sales_collection = db['sales']
  sales_collection.insert_many(entries)

  # Run a find command to view items sold in 2023.
  sales_2023 = sales_collection.count_documents({
      'date': {
          '$gte': datetime(2023, 1, 1),
          '$lt': datetime(2024, 1, 1)
      }
  })

  # Print a message to the output window.
  print(f"{sales_2023} sales occurred in 2023.")

  pipeline = [
      # Find all of the sales that occurred in 2023.
      { '$match': { 'date': { '$gte': datetime(2023, 1, 1), '$lt': datetime(2024, 1, 1) } } },
      # Group the total sales for each product.
      { '$group': { '_id': '$item', 'totalSaleAmount': { '$sum': { '$multiply': [ '$price', '$quantity' ] } } } }
  ]

  cursor = sales_collection.aggregate(pipeline)
  results = list(cursor)
  print(results)
  response = {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'sales_2023': sales_2023,
            'results': results
        })
    }

  return response
