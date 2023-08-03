# MongoDB Atlas Reference Architecture with AWS CDK

This example walks you through building MongoDB Atlas cluster with AWS CDK.

<img src=./images/peering-diagram-serverless.svg>

# How it works

[AWS Cloudformation extensions](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html) allows users to use cloudformation resource types by third-party publishers. With the availability of [CDK constructs provided by MongoDB Atlas](https://github.com/mongodb/mongodbatlas-cloudformation-resources), users are allowed to use AWS CDK to synthesize cloudformation resources with the public extensions provided by MongoDB Atlas and deploy all supported resources such as `MongoDB::Atlas::Cluster`, `MongoDB::Atlas::DatabaseUser` and `MongoDB::Atlas::Project`.

Before using the public extensions, you will need to configure the environment including:

1. Create and specify the execution role CloudFormation uses to activate the extension, in addition to configure logging for the extension as described in the [document](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html).
2. Create an AWS Secret Manager secret to store the API public key and private key as described in the [MongoDB Atlas document](https://github.com/mongodb/mongodbatlas-cloudformation-resources/tree/master#mongodb-atlas-api-keys-credential-management).
3. Allow the IAM role created in step 1 to read the Secret created in step 2.

This examples aims to provide a CDK-native experience to streamline your first MongoDB Atlas cluster creation using AWS CDK.

# Bootstrap your environment

If it's your first time using AWS CDK to create MongoDB Atlas cluster, you will need to configure your environment as described above. This example comes with a `MongoDBAtlasBootstrap` construct that generates and configures everything for you as mentioned above including:

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

Follow the commands in the `Outputs`, let's activate the relevant MongoDB Atlas cloudformation extensions. e.g.


```sh
$ aws cloudformation activate-type --type-name MongoDB::Atlas::Cluster --publisher-id bb989456c78c398a858fef18f2ca1bfc1fbba082 --type RESOURCE --execution-role-arn arn:aws:iam::123456789012:role/cfn-ext-exec-role-for-mongo
```
(You will need to activate `MongoDB::Atlas::Cluster`, `MongoDB::Atlas::DatabaseUser`, `MongoDB::Atlas::Project`,  `MongoDB::Atlas::ProjectIpAccessList`, `MongoDB::Atlas::NetworkContainer`, `MongoDB::Atlas::ServerlessInstance`
and `MongoDB::Atlas::NetworkPeering`)

Alternatively, if you are comfortable using for loop in the shell:

```sh
$ for i in Cluster DatabaseUser Project ProjectIpAccessList NetworkContainer NetworkPeering ServerlessInstance
> do
> aws cloudformation activate-type --type-name MongoDB::Atlas::${i} --publisher-id bb989456c78c398a858fef18f2ca1bfc1fbba082 --type RESOURCE --execution-role-arn arn:aws:iam::123456789012:role/cfn-ext-exec-role-for-mongo
> done
```
(replace `123456789012` with your AWS account ID)

Last but not least, update the Secret with your public and private keys. You can generate your key pair in the MongoDB Atlas console.

> Make sure the user of the API key with the [ORG_GROUP_CREATOR](https://www.mongodb.com/docs/atlas/reference/user-roles/#mongodb-authrole-Organization-Project-Creator) permission as we need to creat a new project in the organization.

Update the key pair in the generated secret with AWS CLI:

```sh
$ export MONGO_ATLAS_PUBLIC_KEY='your_public_key'
$ export MONGO_ATLAS_PRIVATE_KEY='your_private_key'
# update the secret with AWS CLI
$ aws secretsmanager update-secret --secret-id cfn/atlas/profile/my-mongo-profile --secret-string "{\"PublicKey\":\"${MONGO_ATLAS_PUBLIC_KEY}\",\"PrivateKey\":\"${MONGO_ATLAS_PRIVATE_KEY}\"}"
```

Your are all set.

# Create the Cluster with VPC Peering

Now, Let's deploy `mongodb-demo-stack` that creates a replicaSet cluster and a serverless instance with the `AtlasCluster` construct. What happens when you deploy the Demo stack:

1. A new `Project` will be created.
2. A new `DatabaseUser` will be created.
3. A new `Cluster` will be created.
4. A new `ServerlessInstance` will be created.
5. A new `NetworkContainer` will be created.
6. A new `NetworkPeering` will be created.
7. A custom resource `Custom::VpcPeeringHandler` will automatically accept the VPC peering request from MongoDB Atlas.

On creation complete, the VPC peering will be established without any manual approval.

```ts
const demoStack = new Stack(app, 'mongodb-demo-stack', { env });

const vpc = getVpc(demoStack);
const orgId = process.env.MONGODB_ATLAS_ORG_ID || 'mock_id';

// create a ReplicaSet cluster
const cluster = new AtlasCluster(demoStack, 'Cluster', {
  clusterName: 'my-cluster',
  orgId,
  profile: secretProfile,
  replication,
  accessList: [{ ipAddress: vpc.vpcCidrBlock, comment: 'allow from my VPC only' }],
  peering: { vpc, cidr: '192.168.248.0/21' },
  clusterType: ClusterType.REPLICASET,
});

// create a serverless instance
new ServerlessInstance(demoStack, 'ServerlessInstance', {
  instanceName: 'my-serverless-instance',
  profile: secretProfile,
  project: cluster.project,
  continuousBackup: true,
});
```

Read [src/integ.default.ts](./src/integ.default.ts) for the full sample.


The `getVpc()` method essentially reutrn the existing VPC or create a new one based on the context variable received. Use `use_default_vpc=1` for your default VPC, `use_vpc_id=vpc-xxxxx` for a specific VPC or create a new VPC without passing any supported context variables.

The following sample deploy the MongoDB Atlas clsuter and VPC peering with my default VPC:

```sh
$ export MONGODB_ATLAS_ORG_ID='your_org_id'
$ npx cdk deploy mongodb-demo-stack -c use_default_vpc=1
```

On deployment completed, check out the cluster in your MongoDB Atlas console:

<img src=./images/cluster.png>

As this cluster is now VPC peering enabled, you will need to add the Atlas CIDR into your VPC routing tables and enable the `DNS hostnames` and `DNS resolution` for your VPC. This is required to connect the cluster from your VPC. Read [Configure an Atlas Network Peering Connection](https://www.mongodb.com/docs/atlas/security-vpc-peering/#configure-an-service-network-peering-connection) for more details.

The cluster connection string can be found in the outputs:

```
Outputs:
mongodb-demo-stack.mongodbdemoVpcPeeringConnectionId81345C3A = pcx-0780121d0755b997c
mongodb-demo-stack.mongodbdemoconnectionStrings6DEDB530 = mongodb+srv://atlas-cluster-clustermo.4pa5m.mongodb.net
```

# Connect your cluster from your VPC

Re-generate the password for the default database user `atlas-user ` and get the connection URI from the console or simply use the one
from the Outputs.

For example, connect to the cluster from an Amazon Linux instance using `mongosh`:

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

Now, your MongoDB client in your VPC should be able to access the provisioned cluster through a secure peering network without routing to the public internet.

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

