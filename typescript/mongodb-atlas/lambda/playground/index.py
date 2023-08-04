from datetime import datetime, timedelta
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import random, json, os

# Function to generate a random datetime between two dates
def random_date(start_date, end_date):
    time_delta = end_date - start_date
    random_days = random.randint(0, time_delta.days)
    return start_date + timedelta(days=random_days)

def handler(event, context):
  client = boto3.client('secretsmanager')
  secretArn = os.environ.get('CONN_STRING_SECRET')
  uri = client.get_secret_value(
    SecretId=secretArn
  ).get('SecretString')

  client = MongoClient(uri, server_api=ServerApi('1'))

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
