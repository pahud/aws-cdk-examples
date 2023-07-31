# MongoDB Atlas Reference Architecture with AWS CDK

This example walks you through building MongoDB Atlas cluster with AWS CDK.

<img src=./images/peering-diagram.svg>

# How it works

[AWS Cloudformation extensions](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html) allows users to use cloudformation resource types by third-party publishers. With the availability of [CDK constructs provided by MongoDB Atlas](https://github.com/mongodb/mongodbatlas-cloudformation-resources), users are allowed to use AWS CDK to synthesize cloudformation resources with the public extensions provided by MongoDB Atlas and deploy all supported resources such as `MongoDB::Atlas::Cluster`, `MongoDB::Atlas::DatabaseUser` and `MongoDB::Atlas::Project`.

Before using the public extensions, you will need to configure the environment including:

1. Create and specify the execution role CloudFormation uses to activate the extension, in addition to configure logging for the extension as described in the [document](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html).
2. Create an AWS Secret Manager secret to store the API public key and private key as described in the [MongoDB Atlas document](https://github.com/mongodb/mongodbatlas-cloudformation-resources/tree/master#mongodb-atlas-api-keys-credential-management).
3. Allow the IAM role created in step 1 to read the Secret created in step 2.

This examples aims to provide a CDK-native experience to streamline your first MongoDB Atlas cluster creation using AWS CDK.

# Bootstrap your environment

If it's your first time using AWS CDK to create MongoDB Atlas cluster, you will need to configure your environment as described above. This example comes with a `MongoDBAtlasBootstrap` construct that generates and configures everything for you as mentioned above including:

1. Create an cloudformation extension IAM execution role.
2. Create a custo secret to store the public and private API keys.
3. Allow the execution role to access the Secret.

```sh
$ cd typescript/mongodb-atlas
$ yarn install
```

Configure your AWS CLI and make sure it authenticates with AWS.

```sh
$ aws sts get-caller-identity
```

Now, let's bootstrap the extensions to create the IAM execution role and secret.

```sh
$ npx cdk diff mongo-cdk-bootstrap
$ npx cdk deploy mongo-cdk-bootstrap
```

Follow the commands in the `Outputs`, let's activate the relevant MongoDB Atlas cloudformation extensions. e.g.


```sh
$ aws cloudformation activate-type --type-name MongoDB::Atlas::Cluster --publisher-id bb989456c78c398a858fef18f2ca1bfc1fbba082 --type RESOURCE --execution-role-arn arn:aws:iam::123456789012:role/cfn-ext-exec-role-for-mongo
```
(You will need to activate `MongoDB::Atlas::Cluster`, `MongoDB::Atlas::DatabaseUser`, `MongoDB::Atlas::Project`,  `MongoDB::Atlas::ProjectIpAccessList`, `MongoDB::Atlas::NetworkContainer` and `MongoDB::Atlas::NetworkPeering`)

Last but not least, update the Secret with your public and private keys. You can generate your key pair in the MongoDB Atlas console.

> Make sure the user of the API key has the [ORG_GROUP_CREATOR](https://www.mongodb.com/docs/atlas/reference/user-roles/#mongodb-authrole-Organization-Project-Creator) permission as we will creat a new project in a specified organization.

Update the key pair into the generated secret:

```sh
$ export MONGO_ATLAS_PUBLIC_KEY='your_public_key'
$ export MONGO_ATLAS_PRIVATE_KEY='your_private_key'
# update the secret with AWS CLI
$ aws secretsmanager update-secret --secret-id cfn/atlas/profile/my-mongo-profile --secret-string "{\"PublicKey\":\"${MONGO_ATLAS_PUBLIC_KEY}\",\"PrivateKey\":\"${MONGO_ATLAS_PRIVATE_KEY}\"}"
```

Now your are all set. Let's create the sample cluster.

# Create the Cluster with VPC Peering

Now, Let's deploy the `mongodb-demo-stack` that creates the cluster with the `AtlasBasic` L3 construct. What happens when you deploy the Demo stack:

1. A new `Project` will be created.
2. A new `DatabaseUser` will be created.
3. A new `Cluster` will be created.
4. A new `NetworkContainer` will be created.
5. A new `NetworkPeering` will be created.

On creation complete, your VPC will receive a peering request from the MongoDB cluster VPC. Go to AWS console VPC peering connections to accept the peering request.

Read the source for more details in [demo.ts](./src/demo.ts).


```ts
const demoStack = new Stack(app, 'mongodb-demo-stack', { env });

new Demo(demoStack, 'mongodb-demo', {
  secretProfile,
  orgId: process.env.MONGODB_ATLAS_ORG_ID || 'mock_id',
  region: 'US_EAST_1',
  peering: {
    vpc: getVpc(demoStack),
    atlasCidr: '192.168.248.0/21',
  },
});
```

The `getVpc()` method will use the existing VPC or create a new one based on the context variable received. Use `use_default_vpc=1` for your default VPC, `use_vpc_id=vpc-xxxxx` for a specific VPC or create a new VPC without passing any supported context variables.


The following sample deploy the MongoDB Atlas clsuter and VPC peering with my default VPC:

```sh
$ export MONGODB_ATLAS_ORG_ID='your_org_id'
$ npx cdk deploy mongodb-demo-stack -c use_default_vpc=1
```


On deployment completed, you should be able to see a M10 cluster in your MongoDB Atlas console in the relevant organization and project.

<img src=./images/cluster.png>

As this is a cluster with VPC peering enabled, you will need to add the Atlas CIDR into your VPC routing tables and enable the `DNS hostnames` and `DNS resolution` for your VPC. Read [Configure an Atlas Network Peering Connection](https://www.mongodb.com/docs/atlas/security-vpc-peering/#configure-an-service-network-peering-connection) for more details.

# Connect to your cluster from your VPC

Generate the password for the default database user `atlas-user ` and get the connection URI from the console.

For example, connect to the cluster from Amazon Linux 2023 EC2 instance using `mongosh`:

```sh
$ mongosh "mongodb+srv://cluster-mongodb-demo.5y22n.mongodb.net/" --apiVersion 1 --username atlas-user
Enter password: ********
Current Mongosh Log ID: ****************
Connecting to:          mongodb+srv://<credentials>@cluster-mongodb-demo.5y22n.mongodb.net/?appName=mongosh+1.10.2
Using MongoDB:          6.0.8 (API Version 1)
Using Mongosh:          1.10.2

For mongosh info see: https://docs.mongodb.com/mongodb-shell/

Atlas atlas-s45z4s-shard-0 [primary] test> show dbs
admin                      248.00 KiB
config                     280.00 KiB
local                      532.00 KiB
mongodbVSCodePlaygroundDB   72.00 KiB
Atlas atlas-s45z4s-shard-0 [primary] test> 
```

# How does the client DNS resolve the cluster IP addresses

The MongoDB connection string starts with mongodb+srv://, which indicates that it uses the SRV record for DNS resolution. When MongoDB clients encounter an SRV connection string, they follow a specific DNS resolution process to find the appropriate MongoDB server(s) to connect to.

The client essentially append `._mongodb._tcp.` to the extracted domain name to form the SRV record query. In this example, the SRV query would be `_mongodb._tcp.cluster-mongodb-demo.5y22n.mongodb.net.`

If you `dig` on the EC2 instance in the VPC:

```sh
$ dig -t SRV _mongodb._tcp.cluster-mongodb-demo.5y22n.mongodb.net

;_mongodb._tcp.cluster-mongodb-demo.5y22n.mongodb.net. IN SRV

;; ANSWER SECTION:
_mongodb._tcp.cluster-mongodb-demo.5y22n.mongodb.net. 60 IN SRV 0 0 27017 cluster-mongodb-demo-shard-00-01.5y22n.mongodb.net.
_mongodb._tcp.cluster-mongodb-demo.5y22n.mongodb.net. 60 IN SRV 0 0 27017 cluster-mongodb-demo-shard-00-02.5y22n.mongodb.net.
_mongodb._tcp.cluster-mongodb-demo.5y22n.mongodb.net. 60 IN SRV 0 0 27017 cluster-mongodb-demo-shard-00-03.5y22n.mongodb.net.
_mongodb._tcp.cluster-mongodb-demo.5y22n.mongodb.net. 60 IN SRV 0 0 27017 cluster-mongodb-demo-shard-00-00.5y22n.mongodb.net.
```

And the four replica domain names all resolve into private IP addresses:

```sh
$ dig cluster-mongodb-demo-shard-00-01.5y22n.mongodb.net

;cluster-mongodb-demo-shard-00-01.5y22n.mongodb.net. IN A

;; ANSWER SECTION:
cluster-mongodb-demo-shard-00-01.5y22n.mongodb.net. 57 IN CNAME ec2-34-199-107-238.compute-1.amazonaws.com.
ec2-34-199-107-238.compute-1.amazonaws.com. 17 IN A 192.168.248.207
```

Now, your MongoDB client in your VPC should be able to access the provisioned cluster through a secure peering network without routing to the public internet.

# clean up

1. Destroy the mongodb-demo-stack:

```sh
$ npx cdk destroy mongodb-demo-stack
```

2. Destroy the VPC peering and additional routing rules from the AWS console.


3. (Optional) Destroy the bootstrap stack(cloudformation execution role and secret):

```sh
$ npx cdk destroy mongo-cdk-bootstrap
```


# FAQ
**Question: Should I add the billing method before I am allowed to create the cluster?**

Answer: Yes you have to add a default billing method in the MongoDB Atlas console.

**Question: Do I always need to deploy bootstrap stack for every cluster creation?**

Answer: No, the goal of the bootstrap stack is to create a shared cloudformation extension execution role and secret for public and private keys. You don't need to re-bootstrap for additional clusters if you are using the same key pair. However, if you have to use different key pair, you will need to create a different Secret and grant the read to the cloudformation extension execution role. Check out [bootstrap.ts](./src/bootstrap.ts) for more details.

