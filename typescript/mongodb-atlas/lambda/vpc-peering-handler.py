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
  # ...
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
  # ...
  
# def is_complete(event, context):
#   physical_id = event["PhysicalResourceId"]
#   request_type = event["RequestType"]
#   client = boto3.client('ec2')
#   resp = client.describe_instance_connect_endpoints(
#     InstanceConnectEndpointIds=[physical_id]
#   )
#   status = resp.get('InstanceConnectEndpoints')[0].get('State')

#   # check if resource is stable based on request_type
#   if request_type == 'Create':
#     is_ready = True if status == 'create-complete' else False
#   if request_type == 'Update':
#     is_ready = True
#   if request_type == 'Delete':
#     is_ready = True if status == 'delete-complete' else False
  
#   return { 'IsComplete': is_ready }