import boto3
def on_event(event, context):
  print(event)
  request_type = event['RequestType']
  if request_type == 'Create': return on_create(event)
  if request_type == 'Update': return on_update(event)
  if request_type == 'Delete': return on_delete(event)
  raise Exception("Invalid request type: %s" % request_type)

def on_create(event):
  props = event["ResourceProperties"]
  connection_id = props.get('ConnectionId')
  
  print("create new resource with props %s" % props)
  client = boto3.client('ec2')
  resp = client.accept_vpc_peering_connection(
    VpcPeeringConnectionId=connection_id
  )
  return { 'PhysicalResourceId': connection_id }

def on_update(event):
  physical_id = event["PhysicalResourceId"]
  props = event["ResourceProperties"]
  print("update resource %s with props %s" % (physical_id, props))
  return

def on_delete(event):
  physical_id = event["PhysicalResourceId"]
  print("delete resource %s" % physical_id)
  client = boto3.client('ec2')
  resp = client.delete_vpc_peering_connection(
    VpcPeeringConnectionId=physical_id
  )
  print(resp)
  return