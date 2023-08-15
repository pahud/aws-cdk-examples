# MongoDB Atlas Reference Architecture with AWS CDK

This example walks you through building a serverless application using MongoDB Atlas cluster and  serverless instance using AWS CDK.

<img src=./images/peering-diagram-serverless-api.svg>

# How it works

[AWS Cloudformation extensions](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html) allows users to use cloudformation resource types by third-party publishers. With the availability of [CDK constructs provided by MongoDB Atlas](https://github.com/mongodb/awscdk-resources-mongodbatlas), users are allowed to use AWS CDK to synthesize cloudformation resources with the public extensions provided by MongoDB Atlas and deploy all supported resources such as `MongoDB::Atlas::Cluster`, `MongoDB::Atlas::DatabaseUser` and `MongoDB::Atlas::Project`.

While you just focus on AWS CDK, the builder experience is like:

```ts
// build a replica-set cluster
new AtlasCluster(scope, id, props);

// build a serverless instance
new ServerlessInstance(scope, id, props);
```

Before using the public extensions, you will need to configure the environment including:

1. Create and specify the execution role CloudFormation uses to activate the extension, in addition to configure logging for the extension as described in the [document](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html).
2. Create an AWS Secret Manager secret to store the API public key and private key as described in the [MongoDB Atlas document](https://github.com/mongodb/mongodbatlas-cloudformation-resources/tree/master#mongodb-atlas-api-keys-credential-management).
3. Allow the IAM role created in step 1 to read the Secret created in step 2.

This examples aims to provide a CDK-native experience to streamline your first MongoDB Atlas cluster creation using AWS CDK.

# Bootstrap your environment

If it's your first time using AWS CDK to create MongoDB Atlas cluster, you need to configure your environment as described above. This example comes with a `MongoDBAtlasBootstrap` construct that generates and configures everything for you as mentioned above including:

1. Create a cloudformation extension IAM execution role and required permissions(see [doc](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html)).
2. Create a custom profile secret to store public and private API keys(see [doc](https://github.com/mongodb/mongodbatlas-cloudformation-resources#1-configure-your-mongodb-atlas-api-keys)).
3. Allow the execution role to access the profile secret.

```sh
$ cd typescript/mongodb-atlas
$ yarn install
```

Configure your AWS CLI and make sure it authenticates with AWS.

```sh
$ aws sts get-caller-identity
```

Now, let's bootstrap the extensions to create the IAM execution role and the profile secret.

```sh
$ npx cdk diff mongo-cdk-bootstrap
$ npx cdk deploy mongo-cdk-bootstrap
```

Update the Secret with your public and private keys. You can generate your key pair in the MongoDB Atlas console.

> Make sure the user of the API key with the [ORG_GROUP_CREATOR](https://www.mongodb.com/docs/atlas/reference/user-roles/#mongodb-authrole-Organization-Project-Creator) permission as we need to creat a new project in this demo.

Update the key pair in the generated secret with AWS CLI:

```sh
$ export MONGO_ATLAS_PUBLIC_KEY='your_public_key'
$ export MONGO_ATLAS_PRIVATE_KEY='your_private_key'
# update the secret with AWS CLI
$ aws secretsmanager update-secret --secret-id cfn/atlas/profile/my-mongo-profile --secret-string "{\"PublicKey\":\"${MONGO_ATLAS_PUBLIC_KEY}\",\"PrivateKey\":\"${MONGO_ATLAS_PRIVATE_KEY}\"}"
```

Your are all set.

# Demo

Now, Let's deploy the `mongodb-demo-stack` that creates a replicaSet cluster and a serverless instance. The following resources will be created when you deploy the Demo stack:

1. A new `Project`
2. A new `DatabaseUser`
3. A new `Cluster`
4. A new `ServerlessInstance`
5. A new `NetworkContainer`
6. A new `NetworkPeering`
7. A custom resource `Custom::VpcPeeringHandler` that will automatically accept the VPC peering request from MongoDB Atlas.
8. A new secret to store the connection string
9. A demo Lambda Function
10. An API Gateway REST API

On creation complete, the VPC peering will be established without any manual approval.

Read [src/integ.default.ts](./src/integ.default.ts) for the full sample including the Lambda function and API Gateway REST API.

The `getVpc()` method essentially reutrn the existing VPC or create a new one based on the context variable received. Use `use_default_vpc=1` for your default VPC, `use_vpc_id=vpc-xxxxx` for a specific VPC or create a new VPC without passing both context variables.

Deploy it now:

```sh
$ export MONGODB_ATLAS_ORG_ID='your_org_id'
$ npx cdk diff mongodb-demo-stack -c use_default_vpc=1
$ npx cdk deploy mongodb-demo-stack -c use_default_vpc=1
```

On deployment completed, check out the cluster and serverless instance in your MongoDB Atlas console:

<img src=./images/cluster-serverless-instance.png>

And you should see the CDK Outputs like this:

```
mongodb-demo-stack.ClusterVpcPeeringConnectionId734C7A5C = pcx-0e826d4b5b3c4f0b0
mongodb-demo-stack.ClusterconnectionStrings17813228 = mongodb+srv://my-cluster.yti1n.mongodb.net
mongodb-demo-stack.ConnectionStringSecretName = cfn/atlas/connectionString/default
mongodb-demo-stack.RestAPIEndpointB14C3C54 = https://nin9xjrzn0.execute-api.us-east-1.amazonaws.com/prod/
mongodb-demo-stack.ServerlessInstanceConnectionStringB32B56D6 = mongodb+srv://my-serverless-instance.bahxo51.mongodb.net
```

# AtlasCluster

Before we talk about the cluster. Let's first discuss how MongoDB Atlas interconnect with your VPC.

At this moment, MongoDB Atlas supports `VPC Peering` and `VPC private endpoint`.

**VPC Peering**: Allow your VPC traffic route to MongoDB Atlas VPC. **You need to update your routing tables** to add an additional route to Atlas CIDR block.

**VPC Private Endpoint**: It essentially create a private endpoint interface in your VPC private subnet, the DNS name of the connection string will be resolved to the private IP of the endpoint interface that forward the connection to the NLB in MongoDB Atlas environment. You don't need to update your routing tables. 


As this cluster is VPC peering enabled, you will need to add the Atlas CIDR into your VPC routing tables and enable the `DNS hostnames` and `DNS resolution` for your VPC. This is required to connect the cluster from your VPC through VPC peering. Read [Configure an Atlas Network Peering Connection](https://www.mongodb.com/docs/atlas/security-vpc-peering/#configure-an-service-network-peering-connection) for more details.

Find the connection string for the cluster in CDK outputs or in the MongoDB Atlas console.

```
Outputs:
mongodb-demo-stack.mongodbdemoconnectionStrings6DEDB530 = mongodb+srv://atlas-cluster-clustermo.4pa5m.mongodb.net
```

# Connect your cluster from your VPC

Connect to the cluster from an Amazon Linux instance using `mongosh`:

```sh
$ mongosh "mongodb+srv://atlas-cluster-clustermo.4pa5m.mongodb.net/" --apiVersion 1 --username atlas-user
Enter password: *********
Current Mongosh Log ID: ******************
Connecting to:          mongodb+srv://<credentials>@atlas-cluster-clustermo.4pa5m.mongodb.net/?appName=mongosh+1.10.3
Using MongoDB:          6.0.8 (API Version 1)
Using Mongosh:          1.10.3

For mongosh info see: https://docs.mongodb.com/mongodb-shell/


To help improve our products, anonymous usage data is collected and sent to MongoDB periodically (https://www.mongodb.com/legal/privacy-policy).
You can opt-out by running the disableTelemetry() command.

Atlas atlas-3h7l0v-shard-0 [primary] test> show dbs;
admin   232.00 KiB
config  204.00 KiB
local   492.00 KiB
Atlas atlas-3h7l0v-shard-0 [primary] test> 
```
(You can generate your password in the console)


# ServerlessInstance

MongoDB Atlas `ServerlessInstance` is designed for serverless applications with variable or infrequent traffic. 

To create a ServerlessInstance:

```ts
// create a serverless instance
new ServerlessInstance(demoStack, 'ServerlessInstance', {
  orgId,
  instanceName: 'my-serverless-instance',
  profile: secretProfile,
  continuousBackup: true,
});
```

check [src/integ.default.ts](./src/integ.default.ts) for more details.

As `ServerlessInstance` does not support VPC peering and the VPC private endpoint is not provided as CDK L1 construct by MongoDB Atlas at this moment, for now we will just tentatively connect the ServerlessInstance from Lambda function through the public internet. After the VPC private endpoint construct is available, we will update this sample using private endpoint instead. 


# RESTful API with API Gateway, Lambda and MongoDB Atlas ServerlessInstance

Go to MongoDB Atlas console and find the connection string for Python driver.

For example:

```
mongodb+srv://atlas-user:<password>@my-serverless-instance.2er0eio.mongodb.net/?retryWrites=true&w=majority
```
(make sure to replace <password> with your password)

Update the secret with full connection string. This secret will be retrived when Lambda function is invoked.

```sh
$ aws secretsmanager update-secret --secret-id cfn/atlas/connectionString/default --secret-string "mongodb+srv://atlas-user:<password>@my-serverless-instance.2er0eio.mongodb.net/?retryWrites=true&w=majority"
```

OK. Let's open the REST API endpoint from the CDK output:

```sh
$ curl -s https://5momhqf3h2.execute-api.us-east-1.amazonaws.com/prod/ | jq .
{
  "sales_2023": 33,
  "results": [
    {
      "_id": "def",
      "totalSaleAmount": 1669
    },
    {
      "_id": "abc",
      "totalSaleAmount": 2646
    },
    {
      "_id": "jkl",
      "totalSaleAmount": 1490
    },
    {
      "_id": "xyz",
      "totalSaleAmount": 1247
    }
  ]
}
```

Congratulations! You have deployed a modern serverless application running on Amazon API Gateway, AWS Lambda and MongoDB Atlas!


# How does the client DNS resolve the cluster IP addresses

The MongoDB connection string starts with mongodb+srv://, which indicates that it uses the SRV record for DNS resolution. When MongoDB clients encounter an SRV connection string, they follow a specific DNS resolution process to find the appropriate MongoDB server(s) to connect to.

The client essentially append `._mongodb._tcp.` to the extracted domain name to form the SRV record query. In this example, the SRV query would be `_mongodb._tcp.atlas-cluster-clustermo.4pa5m.mongodb.net.`

If you `dig` on the EC2 instance in the VPC:

```sh
$ dig -t SRV _mongodb._tcp.atlas-cluster-clustermo.4pa5m.mongodb.net

;_mongodb._tcp.atlas-cluster-clustermo.4pa5m.mongodb.net. IN SRV

;; ANSWER SECTION:
_mongodb._tcp.atlas-cluster-clustermo.4pa5m.mongodb.net. 60 IN SRV 0 0 27017 atlas-cluster-clustermo-shard-00-00.4pa5m.mongodb.net.
_mongodb._tcp.atlas-cluster-clustermo.4pa5m.mongodb.net. 60 IN SRV 0 0 27017 atlas-cluster-clustermo-shard-00-02.4pa5m.mongodb.net.
_mongodb._tcp.atlas-cluster-clustermo.4pa5m.mongodb.net. 60 IN SRV 0 0 27017 atlas-cluster-clustermo-shard-00-01.4pa5m.mongodb.net.
_mongodb._tcp.atlas-cluster-clustermo.4pa5m.mongodb.net. 60 IN SRV 0 0 27017 atlas-cluster-clustermo-shard-00-03.4pa5m.mongodb.net.

```

And the four replica domain names all resolve into private IP addresses:

```sh
$ dig atlas-cluster-clustermo-shard-00-00.4pa5m.mongodb.net.

;; QUESTION SECTION:
;atlas-cluster-clustermo-shard-00-00.4pa5m.mongodb.net. IN A

;; ANSWER SECTION:
atlas-cluster-clustermo-shard-00-00.4pa5m.mongodb.net. 60 IN CNAME ec2-34-227-203-248.compute-1.amazonaws.com.
ec2-34-227-203-248.compute-1.amazonaws.com. 20 IN A 192.168.254.210
```

# clean up

1. Destroy the mongodb-demo-stack:

```sh
$ npx cdk destroy mongodb-demo-stack
```

2. Make sure the VPC peering is deleted and manually remove additional routing through the peering from the AWS console.


3. (Optional) Destroy the bootstrap stack(cloudformation execution role and secret):

```sh
$ npx cdk destroy mongo-cdk-bootstrap
```

# FAQ
**Question: Do I need to manually accept the VPC peering from AWS console**

Answer: No, the CDK custom resource does this for you. But you need to manually add additional 
routes to the Atlas `cidr` through the vpc peering connection for each routing table.

**Question: Should I add the billing method before I am allowed to create the cluster?**

Answer: Yes you have to add a default billing method in the MongoDB Atlas console.

**Question: What is the default access list for my cluster?**

Answer: You need to specify the `accesslist` for your `AtlasCluster`. If you enable `peering`, you should scope down the ACL to allow
your VPC CIDR block only:

```ts
accessList: [{ ipAddress: vpc.vpcCidrBlock, comment: 'allow from my VPC only' }],
```

Or only from all private subnets:

```ts
accessList: vpc.privateSubnets.map(s => ({ ipAddress: s.ipv4CidrBlock, comment: `allow from ${s.subnetId}` })),
```

**Question: Do I always need to deploy bootstrap stack for every cluster creation?**

Answer: No, the goal of the bootstrap stack is to create a shared cloudformation extension execution role and secret for public and private keys. You don't need to re-bootstrap for additional clusters if you are using the same key pair. However, if you have to use different key pair, you will need to create a different Secret and grant the read to the cloudformation extension execution role. Check out [bootstrap.ts](./src/bootstrap.ts) for more details.

**Question: Does ServerlessInstance support VPC Peering?**

Answer: No, according to MongoDB Atlas [document](https://www.mongodb.com/docs/atlas/reference/serverless-instance-limitations/), network peering is not supported. We will include the vpc private endpoint support in this sample in the future. Before that, you are encouraged to follow the MongoDB Atlas [document](https://www.mongodb.com/docs/atlas/security-private-endpoint/) to enable the VPC private endpoint for your
serverless instance or cluster.

At this moment, VPC peering is supported for the cluster only.
