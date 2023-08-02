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
(You will need to activate `MongoDB::Atlas::Cluster`, `MongoDB::Atlas::DatabaseUser`, `MongoDB::Atlas::Project`,  `MongoDB::Atlas::ProjectIpAccessList`, `MongoDB::Atlas::NetworkContainer` and `MongoDB::Atlas::NetworkPeering`)

Alternatively, if you are comfortable using for loop in the shell:

```sh
$ for i in Cluster DatabaseUser Project ProjectIpAccessList NetworkContainer NetworkPeering
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

Now, Let's deploy `mongodb-demo-stack` that creates the cluster with the `AtlasBasic` L3 construct. What happens when you deploy the Demo stack:

1. A new `Project` will be created.
2. A new `DatabaseUser` will be created.
3. A new `Cluster` will be created.
4. A new `NetworkContainer` will be created.
5. A new `NetworkPeering` will be created.
6. A custom resource `Custom::VpcPeeringHandler` will automatically accept the VPC peering request from MongoDB Atlas.

On creation complete, the VPC peering will be established without any manual approval.

Read the source of [demo.ts](./src/demo.ts) for more details.

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

The `getVpc()` method will either reutrn the existing VPC or create and return a new one based on the context variable received. Use `use_default_vpc=1` for your default VPC, `use_vpc_id=vpc-xxxxx` for a specific VPC or create a new VPC without passing any supported context variables.


The following sample deploy the MongoDB Atlas clsuter and VPC peering with my default VPC:

```sh
$ export MONGODB_ATLAS_ORG_ID='your_org_id'
$ npx cdk deploy mongodb-demo-stack -c use_default_vpc=1
```

On deployment completed, check out the cluster in your MongoDB Atlas console:

<img src=./images/cluster.png>

As this cluster is now VPC peering enabled, you will need to add the Atlas CIDR into your VPC routing tables and enable the `DNS hostnames` and `DNS resolution` for your VPC. This is required to connect the cluster from your VPC. Read [Configure an Atlas Network Peering Connection](https://www.mongodb.com/docs/atlas/security-vpc-peering/#configure-an-service-network-peering-connection) for more details.

# Connect your cluster from your VPC

Generate the password for the default database user `atlas-user ` and get the connection URI from the console.

For example, connect to the cluster from an Amazon Linux instance using `mongosh`:

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

2. Make sure the VPC peering is deleted and manually remove additional routing through the peering from the AWS console.


3. (Optional) Destroy the bootstrap stack(cloudformation execution role and secret):

```sh
$ npx cdk destroy mongo-cdk-bootstrap
```


# FAQ
**Question: Do I need to manually accept the VPC peering from AWS console**

Answer: No, the CDK custom resource does this for you. But you need to manually add an additional
route to the `atlasCidr` through the vpc peering connection. AWS CDK does not do that for you.

**Question: Should I add the billing method before I am allowed to create the cluster?**

Answer: Yes you have to add a default billing method in the MongoDB Atlas console.

**Question: Do I always need to deploy bootstrap stack for every cluster creation?**

Answer: No, the goal of the bootstrap stack is to create a shared cloudformation extension execution role and secret for public and private keys. You don't need to re-bootstrap for additional clusters if you are using the same key pair. However, if you have to use different key pair, you will need to create a different Secret and grant the read to the cloudformation extension execution role. Check out [bootstrap.ts](./src/bootstrap.ts) for more details.


# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### AtlasCluster <a name="AtlasCluster" id="mongodb-atlas.AtlasCluster"></a>

#### Initializers <a name="Initializers" id="mongodb-atlas.AtlasCluster.Initializer"></a>

```typescript
import { AtlasCluster } from 'mongodb-atlas'

new AtlasCluster(scope: Construct, id: string, props: AtlasClusterProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.AtlasCluster.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasCluster.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasCluster.Initializer.parameter.props">props</a></code> | <code><a href="#mongodb-atlas.AtlasClusterProps">AtlasClusterProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.AtlasCluster.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.AtlasCluster.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="mongodb-atlas.AtlasCluster.Initializer.parameter.props"></a>

- *Type:* <a href="#mongodb-atlas.AtlasClusterProps">AtlasClusterProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.AtlasCluster.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="mongodb-atlas.AtlasCluster.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.AtlasCluster.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="mongodb-atlas.AtlasCluster.isConstruct"></a>

```typescript
import { AtlasCluster } from 'mongodb-atlas'

AtlasCluster.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="mongodb-atlas.AtlasCluster.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.AtlasCluster.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#mongodb-atlas.AtlasCluster.property.cluster">cluster</a></code> | <code><a href="#mongodb-atlas.Cluster">Cluster</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasCluster.property.connectionStrings">connectionStrings</a></code> | <code>awscdk-resources-mongodbatlas.ConnectionStrings</code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasCluster.property.databaseUser">databaseUser</a></code> | <code><a href="#mongodb-atlas.DatabaseUser">DatabaseUser</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasCluster.property.ipAccessList">ipAccessList</a></code> | <code><a href="#mongodb-atlas.IpAccessList">IpAccessList</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasCluster.property.orgId">orgId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasCluster.property.profile">profile</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasCluster.property.project">project</a></code> | <code><a href="#mongodb-atlas.IProject">IProject</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasCluster.property.props">props</a></code> | <code><a href="#mongodb-atlas.AtlasClusterProps">AtlasClusterProps</a></code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="mongodb-atlas.AtlasCluster.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `cluster`<sup>Required</sup> <a name="cluster" id="mongodb-atlas.AtlasCluster.property.cluster"></a>

```typescript
public readonly cluster: Cluster;
```

- *Type:* <a href="#mongodb-atlas.Cluster">Cluster</a>

---

##### `connectionStrings`<sup>Required</sup> <a name="connectionStrings" id="mongodb-atlas.AtlasCluster.property.connectionStrings"></a>

```typescript
public readonly connectionStrings: ConnectionStrings;
```

- *Type:* awscdk-resources-mongodbatlas.ConnectionStrings

---

##### `databaseUser`<sup>Required</sup> <a name="databaseUser" id="mongodb-atlas.AtlasCluster.property.databaseUser"></a>

```typescript
public readonly databaseUser: DatabaseUser;
```

- *Type:* <a href="#mongodb-atlas.DatabaseUser">DatabaseUser</a>

---

##### `ipAccessList`<sup>Required</sup> <a name="ipAccessList" id="mongodb-atlas.AtlasCluster.property.ipAccessList"></a>

```typescript
public readonly ipAccessList: IpAccessList;
```

- *Type:* <a href="#mongodb-atlas.IpAccessList">IpAccessList</a>

---

##### `orgId`<sup>Required</sup> <a name="orgId" id="mongodb-atlas.AtlasCluster.property.orgId"></a>

```typescript
public readonly orgId: string;
```

- *Type:* string

---

##### `profile`<sup>Required</sup> <a name="profile" id="mongodb-atlas.AtlasCluster.property.profile"></a>

```typescript
public readonly profile: string;
```

- *Type:* string

---

##### `project`<sup>Required</sup> <a name="project" id="mongodb-atlas.AtlasCluster.property.project"></a>

```typescript
public readonly project: IProject;
```

- *Type:* <a href="#mongodb-atlas.IProject">IProject</a>

---

##### `props`<sup>Required</sup> <a name="props" id="mongodb-atlas.AtlasCluster.property.props"></a>

```typescript
public readonly props: AtlasClusterProps;
```

- *Type:* <a href="#mongodb-atlas.AtlasClusterProps">AtlasClusterProps</a>

---


### Cluster <a name="Cluster" id="mongodb-atlas.Cluster"></a>

- *Implements:* <a href="#mongodb-atlas.ICluster">ICluster</a>

#### Initializers <a name="Initializers" id="mongodb-atlas.Cluster.Initializer"></a>

```typescript
import { Cluster } from 'mongodb-atlas'

new Cluster(scope: Construct, id: string, props: ClusterProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.Cluster.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#mongodb-atlas.Cluster.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.Cluster.Initializer.parameter.props">props</a></code> | <code><a href="#mongodb-atlas.ClusterProps">ClusterProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.Cluster.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.Cluster.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="mongodb-atlas.Cluster.Initializer.parameter.props"></a>

- *Type:* <a href="#mongodb-atlas.ClusterProps">ClusterProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.Cluster.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#mongodb-atlas.Cluster.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |

---

##### `toString` <a name="toString" id="mongodb-atlas.Cluster.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="mongodb-atlas.Cluster.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="mongodb-atlas.Cluster.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.Cluster.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#mongodb-atlas.Cluster.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#mongodb-atlas.Cluster.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#mongodb-atlas.Cluster.fromClusterAttributes">fromClusterAttributes</a></code> | *No description.* |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="mongodb-atlas.Cluster.isConstruct"></a>

```typescript
import { Cluster } from 'mongodb-atlas'

Cluster.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="mongodb-atlas.Cluster.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="mongodb-atlas.Cluster.isOwnedResource"></a>

```typescript
import { Cluster } from 'mongodb-atlas'

Cluster.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="mongodb-atlas.Cluster.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="mongodb-atlas.Cluster.isResource"></a>

```typescript
import { Cluster } from 'mongodb-atlas'

Cluster.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="mongodb-atlas.Cluster.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromClusterAttributes` <a name="fromClusterAttributes" id="mongodb-atlas.Cluster.fromClusterAttributes"></a>

```typescript
import { Cluster } from 'mongodb-atlas'

Cluster.fromClusterAttributes(scope: Construct, id: string, attrs: ClusterAttributes)
```

###### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.Cluster.fromClusterAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.Cluster.fromClusterAttributes.parameter.id"></a>

- *Type:* string

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="mongodb-atlas.Cluster.fromClusterAttributes.parameter.attrs"></a>

- *Type:* <a href="#mongodb-atlas.ClusterAttributes">ClusterAttributes</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.Cluster.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#mongodb-atlas.Cluster.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#mongodb-atlas.Cluster.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#mongodb-atlas.Cluster.property.clusterId">clusterId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.Cluster.property.clusterName">clusterName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.Cluster.property.connectionStrings">connectionStrings</a></code> | <code>awscdk-resources-mongodbatlas.ConnectionStrings</code> | *No description.* |
| <code><a href="#mongodb-atlas.Cluster.property.createdDate">createdDate</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.Cluster.property.mongoDBVersion">mongoDBVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.Cluster.property.stateName">stateName</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="mongodb-atlas.Cluster.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="mongodb-atlas.Cluster.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="mongodb-atlas.Cluster.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `clusterId`<sup>Required</sup> <a name="clusterId" id="mongodb-atlas.Cluster.property.clusterId"></a>

```typescript
public readonly clusterId: string;
```

- *Type:* string

---

##### `clusterName`<sup>Required</sup> <a name="clusterName" id="mongodb-atlas.Cluster.property.clusterName"></a>

```typescript
public readonly clusterName: string;
```

- *Type:* string

---

##### `connectionStrings`<sup>Required</sup> <a name="connectionStrings" id="mongodb-atlas.Cluster.property.connectionStrings"></a>

```typescript
public readonly connectionStrings: ConnectionStrings;
```

- *Type:* awscdk-resources-mongodbatlas.ConnectionStrings

---

##### `createdDate`<sup>Optional</sup> <a name="createdDate" id="mongodb-atlas.Cluster.property.createdDate"></a>

```typescript
public readonly createdDate: string;
```

- *Type:* string

---

##### `mongoDBVersion`<sup>Optional</sup> <a name="mongoDBVersion" id="mongodb-atlas.Cluster.property.mongoDBVersion"></a>

```typescript
public readonly mongoDBVersion: string;
```

- *Type:* string

---

##### `stateName`<sup>Optional</sup> <a name="stateName" id="mongodb-atlas.Cluster.property.stateName"></a>

```typescript
public readonly stateName: string;
```

- *Type:* string

---


### DatabaseUser <a name="DatabaseUser" id="mongodb-atlas.DatabaseUser"></a>

- *Implements:* <a href="#mongodb-atlas.IDatabaseUser">IDatabaseUser</a>

#### Initializers <a name="Initializers" id="mongodb-atlas.DatabaseUser.Initializer"></a>

```typescript
import { DatabaseUser } from 'mongodb-atlas'

new DatabaseUser(scope: Construct, id: string, props: DatabaseUserProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.DatabaseUser.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#mongodb-atlas.DatabaseUser.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.DatabaseUser.Initializer.parameter.props">props</a></code> | <code><a href="#mongodb-atlas.DatabaseUserProps">DatabaseUserProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.DatabaseUser.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.DatabaseUser.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="mongodb-atlas.DatabaseUser.Initializer.parameter.props"></a>

- *Type:* <a href="#mongodb-atlas.DatabaseUserProps">DatabaseUserProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.DatabaseUser.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#mongodb-atlas.DatabaseUser.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |

---

##### `toString` <a name="toString" id="mongodb-atlas.DatabaseUser.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="mongodb-atlas.DatabaseUser.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="mongodb-atlas.DatabaseUser.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.DatabaseUser.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#mongodb-atlas.DatabaseUser.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#mongodb-atlas.DatabaseUser.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#mongodb-atlas.DatabaseUser.fromDatabaseUserAttributes">fromDatabaseUserAttributes</a></code> | *No description.* |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="mongodb-atlas.DatabaseUser.isConstruct"></a>

```typescript
import { DatabaseUser } from 'mongodb-atlas'

DatabaseUser.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="mongodb-atlas.DatabaseUser.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="mongodb-atlas.DatabaseUser.isOwnedResource"></a>

```typescript
import { DatabaseUser } from 'mongodb-atlas'

DatabaseUser.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="mongodb-atlas.DatabaseUser.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="mongodb-atlas.DatabaseUser.isResource"></a>

```typescript
import { DatabaseUser } from 'mongodb-atlas'

DatabaseUser.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="mongodb-atlas.DatabaseUser.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromDatabaseUserAttributes` <a name="fromDatabaseUserAttributes" id="mongodb-atlas.DatabaseUser.fromDatabaseUserAttributes"></a>

```typescript
import { DatabaseUser } from 'mongodb-atlas'

DatabaseUser.fromDatabaseUserAttributes(scope: Construct, id: string, attrs: DatabaseUserAttributes)
```

###### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.DatabaseUser.fromDatabaseUserAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.DatabaseUser.fromDatabaseUserAttributes.parameter.id"></a>

- *Type:* string

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="mongodb-atlas.DatabaseUser.fromDatabaseUserAttributes.parameter.attrs"></a>

- *Type:* <a href="#mongodb-atlas.DatabaseUserAttributes">DatabaseUserAttributes</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.DatabaseUser.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#mongodb-atlas.DatabaseUser.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#mongodb-atlas.DatabaseUser.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#mongodb-atlas.DatabaseUser.property.dabataseUserName">dabataseUserName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.DatabaseUser.property.userCFNIdentifier">userCFNIdentifier</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="mongodb-atlas.DatabaseUser.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="mongodb-atlas.DatabaseUser.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="mongodb-atlas.DatabaseUser.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `dabataseUserName`<sup>Required</sup> <a name="dabataseUserName" id="mongodb-atlas.DatabaseUser.property.dabataseUserName"></a>

```typescript
public readonly dabataseUserName: string;
```

- *Type:* string

---

##### `userCFNIdentifier`<sup>Required</sup> <a name="userCFNIdentifier" id="mongodb-atlas.DatabaseUser.property.userCFNIdentifier"></a>

```typescript
public readonly userCFNIdentifier: string;
```

- *Type:* string

---


### IpAccessList <a name="IpAccessList" id="mongodb-atlas.IpAccessList"></a>

- *Implements:* <a href="#mongodb-atlas.IIpAccessList">IIpAccessList</a>

#### Initializers <a name="Initializers" id="mongodb-atlas.IpAccessList.Initializer"></a>

```typescript
import { IpAccessList } from 'mongodb-atlas'

new IpAccessList(scope: Construct, id: string, props: IpAccessListProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.IpAccessList.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#mongodb-atlas.IpAccessList.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.IpAccessList.Initializer.parameter.props">props</a></code> | <code><a href="#mongodb-atlas.IpAccessListProps">IpAccessListProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.IpAccessList.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.IpAccessList.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="mongodb-atlas.IpAccessList.Initializer.parameter.props"></a>

- *Type:* <a href="#mongodb-atlas.IpAccessListProps">IpAccessListProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.IpAccessList.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#mongodb-atlas.IpAccessList.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |

---

##### `toString` <a name="toString" id="mongodb-atlas.IpAccessList.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="mongodb-atlas.IpAccessList.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="mongodb-atlas.IpAccessList.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.IpAccessList.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#mongodb-atlas.IpAccessList.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#mongodb-atlas.IpAccessList.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#mongodb-atlas.IpAccessList.fromIpAccessListAttributes">fromIpAccessListAttributes</a></code> | *No description.* |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="mongodb-atlas.IpAccessList.isConstruct"></a>

```typescript
import { IpAccessList } from 'mongodb-atlas'

IpAccessList.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="mongodb-atlas.IpAccessList.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="mongodb-atlas.IpAccessList.isOwnedResource"></a>

```typescript
import { IpAccessList } from 'mongodb-atlas'

IpAccessList.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="mongodb-atlas.IpAccessList.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="mongodb-atlas.IpAccessList.isResource"></a>

```typescript
import { IpAccessList } from 'mongodb-atlas'

IpAccessList.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="mongodb-atlas.IpAccessList.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromIpAccessListAttributes` <a name="fromIpAccessListAttributes" id="mongodb-atlas.IpAccessList.fromIpAccessListAttributes"></a>

```typescript
import { IpAccessList } from 'mongodb-atlas'

IpAccessList.fromIpAccessListAttributes(scope: Construct, id: string, attrs: IpAccessListAttributes)
```

###### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.IpAccessList.fromIpAccessListAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.IpAccessList.fromIpAccessListAttributes.parameter.id"></a>

- *Type:* string

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="mongodb-atlas.IpAccessList.fromIpAccessListAttributes.parameter.attrs"></a>

- *Type:* <a href="#mongodb-atlas.IpAccessListAttributes">IpAccessListAttributes</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.IpAccessList.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#mongodb-atlas.IpAccessList.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#mongodb-atlas.IpAccessList.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |

---

##### `node`<sup>Required</sup> <a name="node" id="mongodb-atlas.IpAccessList.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="mongodb-atlas.IpAccessList.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="mongodb-atlas.IpAccessList.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---


### MongoDBAtlasBootstrap <a name="MongoDBAtlasBootstrap" id="mongodb-atlas.MongoDBAtlasBootstrap"></a>

Generate the CFN extension execution role.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html)

#### Initializers <a name="Initializers" id="mongodb-atlas.MongoDBAtlasBootstrap.Initializer"></a>

```typescript
import { MongoDBAtlasBootstrap } from 'mongodb-atlas'

new MongoDBAtlasBootstrap(scope: Construct, id: string, props?: MongoDBAtlasBootstrapProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.Initializer.parameter.props">props</a></code> | <code><a href="#mongodb-atlas.MongoDBAtlasBootstrapProps">MongoDBAtlasBootstrapProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.MongoDBAtlasBootstrap.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.MongoDBAtlasBootstrap.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="mongodb-atlas.MongoDBAtlasBootstrap.Initializer.parameter.props"></a>

- *Type:* <a href="#mongodb-atlas.MongoDBAtlasBootstrapProps">MongoDBAtlasBootstrapProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="mongodb-atlas.MongoDBAtlasBootstrap.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="mongodb-atlas.MongoDBAtlasBootstrap.isConstruct"></a>

```typescript
import { MongoDBAtlasBootstrap } from 'mongodb-atlas'

MongoDBAtlasBootstrap.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="mongodb-atlas.MongoDBAtlasBootstrap.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | *No description.* |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.property.secretProfile">secretProfile</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="mongodb-atlas.MongoDBAtlasBootstrap.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `role`<sup>Required</sup> <a name="role" id="mongodb-atlas.MongoDBAtlasBootstrap.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

---

##### `secretProfile`<sup>Required</sup> <a name="secretProfile" id="mongodb-atlas.MongoDBAtlasBootstrap.property.secretProfile"></a>

```typescript
public readonly secretProfile: string;
```

- *Type:* string

---


### MongoSecretProfile <a name="MongoSecretProfile" id="mongodb-atlas.MongoSecretProfile"></a>

#### Initializers <a name="Initializers" id="mongodb-atlas.MongoSecretProfile.Initializer"></a>

```typescript
import { MongoSecretProfile } from 'mongodb-atlas'

new MongoSecretProfile(scope: Construct, id: string, profileName: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.MongoSecretProfile.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#mongodb-atlas.MongoSecretProfile.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.MongoSecretProfile.Initializer.parameter.profileName">profileName</a></code> | <code>string</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.MongoSecretProfile.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.MongoSecretProfile.Initializer.parameter.id"></a>

- *Type:* string

---

##### `profileName`<sup>Required</sup> <a name="profileName" id="mongodb-atlas.MongoSecretProfile.Initializer.parameter.profileName"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.MongoSecretProfile.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="mongodb-atlas.MongoSecretProfile.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.MongoSecretProfile.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="mongodb-atlas.MongoSecretProfile.isConstruct"></a>

```typescript
import { MongoSecretProfile } from 'mongodb-atlas'

MongoSecretProfile.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="mongodb-atlas.MongoSecretProfile.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.MongoSecretProfile.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="mongodb-atlas.MongoSecretProfile.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### Project <a name="Project" id="mongodb-atlas.Project"></a>

- *Implements:* <a href="#mongodb-atlas.IProject">IProject</a>

#### Initializers <a name="Initializers" id="mongodb-atlas.Project.Initializer"></a>

```typescript
import { Project } from 'mongodb-atlas'

new Project(scope: Construct, id: string, props: ProjectProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.Project.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#mongodb-atlas.Project.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.Project.Initializer.parameter.props">props</a></code> | <code><a href="#mongodb-atlas.ProjectProps">ProjectProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.Project.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.Project.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="mongodb-atlas.Project.Initializer.parameter.props"></a>

- *Type:* <a href="#mongodb-atlas.ProjectProps">ProjectProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.Project.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#mongodb-atlas.Project.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |

---

##### `toString` <a name="toString" id="mongodb-atlas.Project.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="mongodb-atlas.Project.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="mongodb-atlas.Project.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.Project.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#mongodb-atlas.Project.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#mongodb-atlas.Project.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#mongodb-atlas.Project.fromProjectAttributes">fromProjectAttributes</a></code> | *No description.* |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="mongodb-atlas.Project.isConstruct"></a>

```typescript
import { Project } from 'mongodb-atlas'

Project.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="mongodb-atlas.Project.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="mongodb-atlas.Project.isOwnedResource"></a>

```typescript
import { Project } from 'mongodb-atlas'

Project.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="mongodb-atlas.Project.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="mongodb-atlas.Project.isResource"></a>

```typescript
import { Project } from 'mongodb-atlas'

Project.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="mongodb-atlas.Project.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromProjectAttributes` <a name="fromProjectAttributes" id="mongodb-atlas.Project.fromProjectAttributes"></a>

```typescript
import { Project } from 'mongodb-atlas'

Project.fromProjectAttributes(scope: Construct, id: string, attrs: ProjectAttributes)
```

###### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.Project.fromProjectAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.Project.fromProjectAttributes.parameter.id"></a>

- *Type:* string

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="mongodb-atlas.Project.fromProjectAttributes.parameter.attrs"></a>

- *Type:* <a href="#mongodb-atlas.ProjectAttributes">ProjectAttributes</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.Project.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#mongodb-atlas.Project.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#mongodb-atlas.Project.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#mongodb-atlas.Project.property.projectId">projectId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.Project.property.projectName">projectName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.Project.property.projectOwnerId">projectOwnerId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.Project.property.clusterCount">clusterCount</a></code> | <code>number</code> | *No description.* |
| <code><a href="#mongodb-atlas.Project.property.created">created</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="mongodb-atlas.Project.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="mongodb-atlas.Project.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="mongodb-atlas.Project.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `projectId`<sup>Required</sup> <a name="projectId" id="mongodb-atlas.Project.property.projectId"></a>

```typescript
public readonly projectId: string;
```

- *Type:* string

---

##### `projectName`<sup>Required</sup> <a name="projectName" id="mongodb-atlas.Project.property.projectName"></a>

```typescript
public readonly projectName: string;
```

- *Type:* string

---

##### `projectOwnerId`<sup>Required</sup> <a name="projectOwnerId" id="mongodb-atlas.Project.property.projectOwnerId"></a>

```typescript
public readonly projectOwnerId: string;
```

- *Type:* string

---

##### `clusterCount`<sup>Optional</sup> <a name="clusterCount" id="mongodb-atlas.Project.property.clusterCount"></a>

```typescript
public readonly clusterCount: number;
```

- *Type:* number

---

##### `created`<sup>Optional</sup> <a name="created" id="mongodb-atlas.Project.property.created"></a>

```typescript
public readonly created: string;
```

- *Type:* string

---


## Structs <a name="Structs" id="Structs"></a>

### AccessList <a name="AccessList" id="mongodb-atlas.AccessList"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.AccessList.Initializer"></a>

```typescript
import { AccessList } from 'mongodb-atlas'

const accessList: AccessList = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.AccessList.property.comment">comment</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.AccessList.property.ipAddress">ipAddress</a></code> | <code>string</code> | *No description.* |

---

##### `comment`<sup>Required</sup> <a name="comment" id="mongodb-atlas.AccessList.property.comment"></a>

```typescript
public readonly comment: string;
```

- *Type:* string

---

##### `ipAddress`<sup>Required</sup> <a name="ipAddress" id="mongodb-atlas.AccessList.property.ipAddress"></a>

```typescript
public readonly ipAddress: string;
```

- *Type:* string

---

### AtlasClusterProps <a name="AtlasClusterProps" id="mongodb-atlas.AtlasClusterProps"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.AtlasClusterProps.Initializer"></a>

```typescript
import { AtlasClusterProps } from 'mongodb-atlas'

const atlasClusterProps: AtlasClusterProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.AtlasClusterProps.property.accessList">accessList</a></code> | <code><a href="#mongodb-atlas.AccessList">AccessList</a>[]</code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasClusterProps.property.orgId">orgId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasClusterProps.property.profile">profile</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasClusterProps.property.replication">replication</a></code> | <code><a href="#mongodb-atlas.ReplicationSpecs">ReplicationSpecs</a>[]</code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasClusterProps.property.peering">peering</a></code> | <code><a href="#mongodb-atlas.PeeringProps">PeeringProps</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasClusterProps.property.project">project</a></code> | <code><a href="#mongodb-atlas.IProject">IProject</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.AtlasClusterProps.property.region">region</a></code> | <code><a href="#mongodb-atlas.AwsRegion">AwsRegion</a></code> | region for the network container. |
| <code><a href="#mongodb-atlas.AtlasClusterProps.property.user">user</a></code> | <code><a href="#mongodb-atlas.IDatabaseUser">IDatabaseUser</a></code> | *No description.* |

---

##### `accessList`<sup>Required</sup> <a name="accessList" id="mongodb-atlas.AtlasClusterProps.property.accessList"></a>

```typescript
public readonly accessList: AccessList[];
```

- *Type:* <a href="#mongodb-atlas.AccessList">AccessList</a>[]

---

##### `orgId`<sup>Required</sup> <a name="orgId" id="mongodb-atlas.AtlasClusterProps.property.orgId"></a>

```typescript
public readonly orgId: string;
```

- *Type:* string

---

##### `profile`<sup>Required</sup> <a name="profile" id="mongodb-atlas.AtlasClusterProps.property.profile"></a>

```typescript
public readonly profile: string;
```

- *Type:* string

---

##### `replication`<sup>Required</sup> <a name="replication" id="mongodb-atlas.AtlasClusterProps.property.replication"></a>

```typescript
public readonly replication: ReplicationSpecs[];
```

- *Type:* <a href="#mongodb-atlas.ReplicationSpecs">ReplicationSpecs</a>[]

---

##### `peering`<sup>Optional</sup> <a name="peering" id="mongodb-atlas.AtlasClusterProps.property.peering"></a>

```typescript
public readonly peering: PeeringProps;
```

- *Type:* <a href="#mongodb-atlas.PeeringProps">PeeringProps</a>

---

##### `project`<sup>Optional</sup> <a name="project" id="mongodb-atlas.AtlasClusterProps.property.project"></a>

```typescript
public readonly project: IProject;
```

- *Type:* <a href="#mongodb-atlas.IProject">IProject</a>

---

##### `region`<sup>Optional</sup> <a name="region" id="mongodb-atlas.AtlasClusterProps.property.region"></a>

```typescript
public readonly region: AwsRegion;
```

- *Type:* <a href="#mongodb-atlas.AwsRegion">AwsRegion</a>
- *Default:* US_EAST_1

region for the network container.

---

##### `user`<sup>Optional</sup> <a name="user" id="mongodb-atlas.AtlasClusterProps.property.user"></a>

```typescript
public readonly user: IDatabaseUser;
```

- *Type:* <a href="#mongodb-atlas.IDatabaseUser">IDatabaseUser</a>

---

### ClusterAttributes <a name="ClusterAttributes" id="mongodb-atlas.ClusterAttributes"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.ClusterAttributes.Initializer"></a>

```typescript
import { ClusterAttributes } from 'mongodb-atlas'

const clusterAttributes: ClusterAttributes = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.ClusterAttributes.property.clusterId">clusterId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.ClusterAttributes.property.clusterName">clusterName</a></code> | <code>string</code> | *No description.* |

---

##### `clusterId`<sup>Required</sup> <a name="clusterId" id="mongodb-atlas.ClusterAttributes.property.clusterId"></a>

```typescript
public readonly clusterId: string;
```

- *Type:* string

---

##### `clusterName`<sup>Required</sup> <a name="clusterName" id="mongodb-atlas.ClusterAttributes.property.clusterName"></a>

```typescript
public readonly clusterName: string;
```

- *Type:* string

---

### ClusterOptions <a name="ClusterOptions" id="mongodb-atlas.ClusterOptions"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.ClusterOptions.Initializer"></a>

```typescript
import { ClusterOptions } from 'mongodb-atlas'

const clusterOptions: ClusterOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.ClusterOptions.property.advancedSettings">advancedSettings</a></code> | <code>awscdk-resources-mongodbatlas.ProcessArgs</code> | Advanced configuration details to add for one cluster in the specified project. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.backupEnabled">backupEnabled</a></code> | <code>boolean</code> | Flag that indicates whether the cluster can perform backups. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.biConnector">biConnector</a></code> | <code>awscdk-resources-mongodbatlas.CfnClusterPropsBiConnector</code> | Settings needed to configure the MongoDB Connector for Business Intelligence for this cluster. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.clusterType">clusterType</a></code> | <code><a href="#mongodb-atlas.ClusterType">ClusterType</a></code> | Configuration of nodes that comprise the cluster. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.connectionStrings">connectionStrings</a></code> | <code>awscdk-resources-mongodbatlas.ConnectionStrings</code> | Set of connection strings that your applications use to connect to this cluster. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.diskSizeGb">diskSizeGb</a></code> | <code>number</code> | Storage capacity that the host's root volume possesses expressed in gigabytes. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.encryptionAtRestProvider">encryptionAtRestProvider</a></code> | <code>awscdk-resources-mongodbatlas.CfnClusterPropsEncryptionAtRestProvider</code> | Cloud service provider that manages your customer keys to provide an additional layer of encryption at rest for the cluster. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.labels">labels</a></code> | <code>awscdk-resources-mongodbatlas.CfnClusterPropsLabels[]</code> | Collection of key-value pairs between 1 and 255 characters in length that tag and categorize the cluster. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.mongoDbMajorVersion">mongoDbMajorVersion</a></code> | <code>string</code> | Major MongoDB version of the cluster. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.name">name</a></code> | <code>string</code> | Human-readable label that identifies the advanced cluster. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.paused">paused</a></code> | <code>boolean</code> | Flag that indicates whether the cluster is paused or not. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.pitEnabled">pitEnabled</a></code> | <code>boolean</code> | Flag that indicates whether the cluster uses continuous cloud backups. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.replicationSpecs">replicationSpecs</a></code> | <code>awscdk-resources-mongodbatlas.AdvancedReplicationSpec[]</code> | List of settings that configure your cluster regions. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.rootCertType">rootCertType</a></code> | <code>string</code> | Root Certificate Authority that MongoDB Cloud cluster uses. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.terminationProtectionEnabled">terminationProtectionEnabled</a></code> | <code>boolean</code> | Flag that indicates whether termination protection is enabled on the cluster. |
| <code><a href="#mongodb-atlas.ClusterOptions.property.versionReleaseSystem">versionReleaseSystem</a></code> | <code>string</code> | Method by which the cluster maintains the MongoDB versions. |

---

##### `advancedSettings`<sup>Optional</sup> <a name="advancedSettings" id="mongodb-atlas.ClusterOptions.property.advancedSettings"></a>

```typescript
public readonly advancedSettings: ProcessArgs;
```

- *Type:* awscdk-resources-mongodbatlas.ProcessArgs

Advanced configuration details to add for one cluster in the specified project.

---

##### `backupEnabled`<sup>Optional</sup> <a name="backupEnabled" id="mongodb-atlas.ClusterOptions.property.backupEnabled"></a>

```typescript
public readonly backupEnabled: boolean;
```

- *Type:* boolean

Flag that indicates whether the cluster can perform backups.

If set to true, the cluster can perform backups.
You must set this value to true for NVMe clusters. Backup uses Cloud Backups for dedicated clusters and Shared Cluster
Backups for tenant clusters. If set to false, the cluster doesn't use backups.

---

##### `biConnector`<sup>Optional</sup> <a name="biConnector" id="mongodb-atlas.ClusterOptions.property.biConnector"></a>

```typescript
public readonly biConnector: CfnClusterPropsBiConnector;
```

- *Type:* awscdk-resources-mongodbatlas.CfnClusterPropsBiConnector

Settings needed to configure the MongoDB Connector for Business Intelligence for this cluster.

---

##### `clusterType`<sup>Optional</sup> <a name="clusterType" id="mongodb-atlas.ClusterOptions.property.clusterType"></a>

```typescript
public readonly clusterType: ClusterType;
```

- *Type:* <a href="#mongodb-atlas.ClusterType">ClusterType</a>
- *Default:* ClusterType.REPLICASET

Configuration of nodes that comprise the cluster.

Atlas accepts: `REPLICASET`, `SHARDED`, `GEOSHARDED`.

---

##### `connectionStrings`<sup>Optional</sup> <a name="connectionStrings" id="mongodb-atlas.ClusterOptions.property.connectionStrings"></a>

```typescript
public readonly connectionStrings: ConnectionStrings;
```

- *Type:* awscdk-resources-mongodbatlas.ConnectionStrings
- *Default:* REPLICASET

Set of connection strings that your applications use to connect to this cluster.

Use the parameters
in this object to connect your applications to this cluster.
See the MongoDB [Connection String URI Format](https://docs.mongodb.com/manual/reference/connection-string/) reference for further details.

---

##### `diskSizeGb`<sup>Optional</sup> <a name="diskSizeGb" id="mongodb-atlas.ClusterOptions.property.diskSizeGb"></a>

```typescript
public readonly diskSizeGb: number;
```

- *Type:* number

Storage capacity that the host's root volume possesses expressed in gigabytes.

Increase this number to add capacity.
MongoDB Cloud requires this parameter if you set replicationSpecs. If you specify a disk size below the minimum (10 GB),
this parameter defaults to the minimum disk size value. Storage charge calculations depend on whether you choose the
default value or a custom value. The maximum value for disk storage cannot exceed 50 times the maximum RAM for the selected cluster.
If you require more storage space, consider upgrading your cluster to a higher tier.

---

##### `encryptionAtRestProvider`<sup>Optional</sup> <a name="encryptionAtRestProvider" id="mongodb-atlas.ClusterOptions.property.encryptionAtRestProvider"></a>

```typescript
public readonly encryptionAtRestProvider: CfnClusterPropsEncryptionAtRestProvider;
```

- *Type:* awscdk-resources-mongodbatlas.CfnClusterPropsEncryptionAtRestProvider

Cloud service provider that manages your customer keys to provide an additional layer of encryption at rest for the cluster.

To enable customer key management for encryption at rest, the cluster replicationSpecs[n].regionConfigs[m].{type}Specs.instanceSize
setting must be M10 or higher and "backupEnabled" : false or omitted entirely.

---

##### `labels`<sup>Optional</sup> <a name="labels" id="mongodb-atlas.ClusterOptions.property.labels"></a>

```typescript
public readonly labels: CfnClusterPropsLabels[];
```

- *Type:* awscdk-resources-mongodbatlas.CfnClusterPropsLabels[]

Collection of key-value pairs between 1 and 255 characters in length that tag and categorize the cluster.

The MongoDB Cloud console doesn't display your labels.

---

##### `mongoDbMajorVersion`<sup>Optional</sup> <a name="mongoDbMajorVersion" id="mongodb-atlas.ClusterOptions.property.mongoDbMajorVersion"></a>

```typescript
public readonly mongoDbMajorVersion: string;
```

- *Type:* string

Major MongoDB version of the cluster.

MongoDB Cloud deploys the cluster with the latest stable release of the specified
version.

---

##### `name`<sup>Optional</sup> <a name="name" id="mongodb-atlas.ClusterOptions.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string
- *Default:* auto-generated.

Human-readable label that identifies the advanced cluster.

---

##### `paused`<sup>Optional</sup> <a name="paused" id="mongodb-atlas.ClusterOptions.property.paused"></a>

```typescript
public readonly paused: boolean;
```

- *Type:* boolean
- *Default:* auto-generated

Flag that indicates whether the cluster is paused or not.

---

##### `pitEnabled`<sup>Optional</sup> <a name="pitEnabled" id="mongodb-atlas.ClusterOptions.property.pitEnabled"></a>

```typescript
public readonly pitEnabled: boolean;
```

- *Type:* boolean

Flag that indicates whether the cluster uses continuous cloud backups.

---

##### `replicationSpecs`<sup>Optional</sup> <a name="replicationSpecs" id="mongodb-atlas.ClusterOptions.property.replicationSpecs"></a>

```typescript
public readonly replicationSpecs: AdvancedReplicationSpec[];
```

- *Type:* awscdk-resources-mongodbatlas.AdvancedReplicationSpec[]

List of settings that configure your cluster regions.

For Global Clusters, each object in the array represents a zone
where your clusters nodes deploy. For non-Global replica sets and sharded clusters, this array has one object representing
where your clusters nodes deploy.

---

##### `rootCertType`<sup>Optional</sup> <a name="rootCertType" id="mongodb-atlas.ClusterOptions.property.rootCertType"></a>

```typescript
public readonly rootCertType: string;
```

- *Type:* string

Root Certificate Authority that MongoDB Cloud cluster uses.

MongoDB Cloud supports Internet Security Research Group.

---

##### `terminationProtectionEnabled`<sup>Optional</sup> <a name="terminationProtectionEnabled" id="mongodb-atlas.ClusterOptions.property.terminationProtectionEnabled"></a>

```typescript
public readonly terminationProtectionEnabled: boolean;
```

- *Type:* boolean

Flag that indicates whether termination protection is enabled on the cluster.

If set to true, MongoDB Cloud won't delete
the cluster. If set to false, MongoDB Cloud will delete the cluster.

---

##### `versionReleaseSystem`<sup>Optional</sup> <a name="versionReleaseSystem" id="mongodb-atlas.ClusterOptions.property.versionReleaseSystem"></a>

```typescript
public readonly versionReleaseSystem: string;
```

- *Type:* string

Method by which the cluster maintains the MongoDB versions.

If value is CONTINUOUS, you must not specify
mongoDBMajorVersion

---

### ClusterProps <a name="ClusterProps" id="mongodb-atlas.ClusterProps"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.ClusterProps.Initializer"></a>

```typescript
import { ClusterProps } from 'mongodb-atlas'

const clusterProps: ClusterProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.ClusterProps.property.account">account</a></code> | <code>string</code> | The AWS account ID this resource belongs to. |
| <code><a href="#mongodb-atlas.ClusterProps.property.environmentFromArn">environmentFromArn</a></code> | <code>string</code> | ARN to deduce region and account from. |
| <code><a href="#mongodb-atlas.ClusterProps.property.physicalName">physicalName</a></code> | <code>string</code> | The value passed in by users to the physical name prop of the resource. |
| <code><a href="#mongodb-atlas.ClusterProps.property.region">region</a></code> | <code>string</code> | The AWS region this resource belongs to. |
| <code><a href="#mongodb-atlas.ClusterProps.property.advancedSettings">advancedSettings</a></code> | <code>awscdk-resources-mongodbatlas.ProcessArgs</code> | Advanced configuration details to add for one cluster in the specified project. |
| <code><a href="#mongodb-atlas.ClusterProps.property.backupEnabled">backupEnabled</a></code> | <code>boolean</code> | Flag that indicates whether the cluster can perform backups. |
| <code><a href="#mongodb-atlas.ClusterProps.property.biConnector">biConnector</a></code> | <code>awscdk-resources-mongodbatlas.CfnClusterPropsBiConnector</code> | Settings needed to configure the MongoDB Connector for Business Intelligence for this cluster. |
| <code><a href="#mongodb-atlas.ClusterProps.property.clusterType">clusterType</a></code> | <code><a href="#mongodb-atlas.ClusterType">ClusterType</a></code> | Configuration of nodes that comprise the cluster. |
| <code><a href="#mongodb-atlas.ClusterProps.property.connectionStrings">connectionStrings</a></code> | <code>awscdk-resources-mongodbatlas.ConnectionStrings</code> | Set of connection strings that your applications use to connect to this cluster. |
| <code><a href="#mongodb-atlas.ClusterProps.property.diskSizeGb">diskSizeGb</a></code> | <code>number</code> | Storage capacity that the host's root volume possesses expressed in gigabytes. |
| <code><a href="#mongodb-atlas.ClusterProps.property.encryptionAtRestProvider">encryptionAtRestProvider</a></code> | <code>awscdk-resources-mongodbatlas.CfnClusterPropsEncryptionAtRestProvider</code> | Cloud service provider that manages your customer keys to provide an additional layer of encryption at rest for the cluster. |
| <code><a href="#mongodb-atlas.ClusterProps.property.labels">labels</a></code> | <code>awscdk-resources-mongodbatlas.CfnClusterPropsLabels[]</code> | Collection of key-value pairs between 1 and 255 characters in length that tag and categorize the cluster. |
| <code><a href="#mongodb-atlas.ClusterProps.property.mongoDbMajorVersion">mongoDbMajorVersion</a></code> | <code>string</code> | Major MongoDB version of the cluster. |
| <code><a href="#mongodb-atlas.ClusterProps.property.name">name</a></code> | <code>string</code> | Human-readable label that identifies the advanced cluster. |
| <code><a href="#mongodb-atlas.ClusterProps.property.paused">paused</a></code> | <code>boolean</code> | Flag that indicates whether the cluster is paused or not. |
| <code><a href="#mongodb-atlas.ClusterProps.property.pitEnabled">pitEnabled</a></code> | <code>boolean</code> | Flag that indicates whether the cluster uses continuous cloud backups. |
| <code><a href="#mongodb-atlas.ClusterProps.property.replicationSpecs">replicationSpecs</a></code> | <code>awscdk-resources-mongodbatlas.AdvancedReplicationSpec[]</code> | List of settings that configure your cluster regions. |
| <code><a href="#mongodb-atlas.ClusterProps.property.rootCertType">rootCertType</a></code> | <code>string</code> | Root Certificate Authority that MongoDB Cloud cluster uses. |
| <code><a href="#mongodb-atlas.ClusterProps.property.terminationProtectionEnabled">terminationProtectionEnabled</a></code> | <code>boolean</code> | Flag that indicates whether termination protection is enabled on the cluster. |
| <code><a href="#mongodb-atlas.ClusterProps.property.versionReleaseSystem">versionReleaseSystem</a></code> | <code>string</code> | Method by which the cluster maintains the MongoDB versions. |
| <code><a href="#mongodb-atlas.ClusterProps.property.profile">profile</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.ClusterProps.property.project">project</a></code> | <code><a href="#mongodb-atlas.IProject">IProject</a></code> | *No description.* |

---

##### `account`<sup>Optional</sup> <a name="account" id="mongodb-atlas.ClusterProps.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string
- *Default:* the resource is in the same account as the stack it belongs to

The AWS account ID this resource belongs to.

---

##### `environmentFromArn`<sup>Optional</sup> <a name="environmentFromArn" id="mongodb-atlas.ClusterProps.property.environmentFromArn"></a>

```typescript
public readonly environmentFromArn: string;
```

- *Type:* string
- *Default:* take environment from `account`, `region` parameters, or use Stack environment.

ARN to deduce region and account from.

The ARN is parsed and the account and region are taken from the ARN.
This should be used for imported resources.

Cannot be supplied together with either `account` or `region`.

---

##### `physicalName`<sup>Optional</sup> <a name="physicalName" id="mongodb-atlas.ClusterProps.property.physicalName"></a>

```typescript
public readonly physicalName: string;
```

- *Type:* string
- *Default:* The physical name will be allocated by CloudFormation at deployment time

The value passed in by users to the physical name prop of the resource.

`undefined` implies that a physical name will be allocated by
  CloudFormation during deployment.
- a concrete value implies a specific physical name
- `PhysicalName.GENERATE_IF_NEEDED` is a marker that indicates that a physical will only be generated
  by the CDK if it is needed for cross-environment references. Otherwise, it will be allocated by CloudFormation.

---

##### `region`<sup>Optional</sup> <a name="region" id="mongodb-atlas.ClusterProps.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string
- *Default:* the resource is in the same region as the stack it belongs to

The AWS region this resource belongs to.

---

##### `advancedSettings`<sup>Optional</sup> <a name="advancedSettings" id="mongodb-atlas.ClusterProps.property.advancedSettings"></a>

```typescript
public readonly advancedSettings: ProcessArgs;
```

- *Type:* awscdk-resources-mongodbatlas.ProcessArgs

Advanced configuration details to add for one cluster in the specified project.

---

##### `backupEnabled`<sup>Optional</sup> <a name="backupEnabled" id="mongodb-atlas.ClusterProps.property.backupEnabled"></a>

```typescript
public readonly backupEnabled: boolean;
```

- *Type:* boolean

Flag that indicates whether the cluster can perform backups.

If set to true, the cluster can perform backups.
You must set this value to true for NVMe clusters. Backup uses Cloud Backups for dedicated clusters and Shared Cluster
Backups for tenant clusters. If set to false, the cluster doesn't use backups.

---

##### `biConnector`<sup>Optional</sup> <a name="biConnector" id="mongodb-atlas.ClusterProps.property.biConnector"></a>

```typescript
public readonly biConnector: CfnClusterPropsBiConnector;
```

- *Type:* awscdk-resources-mongodbatlas.CfnClusterPropsBiConnector

Settings needed to configure the MongoDB Connector for Business Intelligence for this cluster.

---

##### `clusterType`<sup>Optional</sup> <a name="clusterType" id="mongodb-atlas.ClusterProps.property.clusterType"></a>

```typescript
public readonly clusterType: ClusterType;
```

- *Type:* <a href="#mongodb-atlas.ClusterType">ClusterType</a>
- *Default:* ClusterType.REPLICASET

Configuration of nodes that comprise the cluster.

Atlas accepts: `REPLICASET`, `SHARDED`, `GEOSHARDED`.

---

##### `connectionStrings`<sup>Optional</sup> <a name="connectionStrings" id="mongodb-atlas.ClusterProps.property.connectionStrings"></a>

```typescript
public readonly connectionStrings: ConnectionStrings;
```

- *Type:* awscdk-resources-mongodbatlas.ConnectionStrings
- *Default:* REPLICASET

Set of connection strings that your applications use to connect to this cluster.

Use the parameters
in this object to connect your applications to this cluster.
See the MongoDB [Connection String URI Format](https://docs.mongodb.com/manual/reference/connection-string/) reference for further details.

---

##### `diskSizeGb`<sup>Optional</sup> <a name="diskSizeGb" id="mongodb-atlas.ClusterProps.property.diskSizeGb"></a>

```typescript
public readonly diskSizeGb: number;
```

- *Type:* number

Storage capacity that the host's root volume possesses expressed in gigabytes.

Increase this number to add capacity.
MongoDB Cloud requires this parameter if you set replicationSpecs. If you specify a disk size below the minimum (10 GB),
this parameter defaults to the minimum disk size value. Storage charge calculations depend on whether you choose the
default value or a custom value. The maximum value for disk storage cannot exceed 50 times the maximum RAM for the selected cluster.
If you require more storage space, consider upgrading your cluster to a higher tier.

---

##### `encryptionAtRestProvider`<sup>Optional</sup> <a name="encryptionAtRestProvider" id="mongodb-atlas.ClusterProps.property.encryptionAtRestProvider"></a>

```typescript
public readonly encryptionAtRestProvider: CfnClusterPropsEncryptionAtRestProvider;
```

- *Type:* awscdk-resources-mongodbatlas.CfnClusterPropsEncryptionAtRestProvider

Cloud service provider that manages your customer keys to provide an additional layer of encryption at rest for the cluster.

To enable customer key management for encryption at rest, the cluster replicationSpecs[n].regionConfigs[m].{type}Specs.instanceSize
setting must be M10 or higher and "backupEnabled" : false or omitted entirely.

---

##### `labels`<sup>Optional</sup> <a name="labels" id="mongodb-atlas.ClusterProps.property.labels"></a>

```typescript
public readonly labels: CfnClusterPropsLabels[];
```

- *Type:* awscdk-resources-mongodbatlas.CfnClusterPropsLabels[]

Collection of key-value pairs between 1 and 255 characters in length that tag and categorize the cluster.

The MongoDB Cloud console doesn't display your labels.

---

##### `mongoDbMajorVersion`<sup>Optional</sup> <a name="mongoDbMajorVersion" id="mongodb-atlas.ClusterProps.property.mongoDbMajorVersion"></a>

```typescript
public readonly mongoDbMajorVersion: string;
```

- *Type:* string

Major MongoDB version of the cluster.

MongoDB Cloud deploys the cluster with the latest stable release of the specified
version.

---

##### `name`<sup>Optional</sup> <a name="name" id="mongodb-atlas.ClusterProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string
- *Default:* auto-generated.

Human-readable label that identifies the advanced cluster.

---

##### `paused`<sup>Optional</sup> <a name="paused" id="mongodb-atlas.ClusterProps.property.paused"></a>

```typescript
public readonly paused: boolean;
```

- *Type:* boolean
- *Default:* auto-generated

Flag that indicates whether the cluster is paused or not.

---

##### `pitEnabled`<sup>Optional</sup> <a name="pitEnabled" id="mongodb-atlas.ClusterProps.property.pitEnabled"></a>

```typescript
public readonly pitEnabled: boolean;
```

- *Type:* boolean

Flag that indicates whether the cluster uses continuous cloud backups.

---

##### `replicationSpecs`<sup>Optional</sup> <a name="replicationSpecs" id="mongodb-atlas.ClusterProps.property.replicationSpecs"></a>

```typescript
public readonly replicationSpecs: AdvancedReplicationSpec[];
```

- *Type:* awscdk-resources-mongodbatlas.AdvancedReplicationSpec[]

List of settings that configure your cluster regions.

For Global Clusters, each object in the array represents a zone
where your clusters nodes deploy. For non-Global replica sets and sharded clusters, this array has one object representing
where your clusters nodes deploy.

---

##### `rootCertType`<sup>Optional</sup> <a name="rootCertType" id="mongodb-atlas.ClusterProps.property.rootCertType"></a>

```typescript
public readonly rootCertType: string;
```

- *Type:* string

Root Certificate Authority that MongoDB Cloud cluster uses.

MongoDB Cloud supports Internet Security Research Group.

---

##### `terminationProtectionEnabled`<sup>Optional</sup> <a name="terminationProtectionEnabled" id="mongodb-atlas.ClusterProps.property.terminationProtectionEnabled"></a>

```typescript
public readonly terminationProtectionEnabled: boolean;
```

- *Type:* boolean

Flag that indicates whether termination protection is enabled on the cluster.

If set to true, MongoDB Cloud won't delete
the cluster. If set to false, MongoDB Cloud will delete the cluster.

---

##### `versionReleaseSystem`<sup>Optional</sup> <a name="versionReleaseSystem" id="mongodb-atlas.ClusterProps.property.versionReleaseSystem"></a>

```typescript
public readonly versionReleaseSystem: string;
```

- *Type:* string

Method by which the cluster maintains the MongoDB versions.

If value is CONTINUOUS, you must not specify
mongoDBMajorVersion

---

##### `profile`<sup>Required</sup> <a name="profile" id="mongodb-atlas.ClusterProps.property.profile"></a>

```typescript
public readonly profile: string;
```

- *Type:* string

---

##### `project`<sup>Required</sup> <a name="project" id="mongodb-atlas.ClusterProps.property.project"></a>

```typescript
public readonly project: IProject;
```

- *Type:* <a href="#mongodb-atlas.IProject">IProject</a>

---

### DatabaseUserAttributes <a name="DatabaseUserAttributes" id="mongodb-atlas.DatabaseUserAttributes"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.DatabaseUserAttributes.Initializer"></a>

```typescript
import { DatabaseUserAttributes } from 'mongodb-atlas'

const databaseUserAttributes: DatabaseUserAttributes = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.DatabaseUserAttributes.property.dabataseUserName">dabataseUserName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.DatabaseUserAttributes.property.userCFNIdentifier">userCFNIdentifier</a></code> | <code>string</code> | *No description.* |

---

##### `dabataseUserName`<sup>Required</sup> <a name="dabataseUserName" id="mongodb-atlas.DatabaseUserAttributes.property.dabataseUserName"></a>

```typescript
public readonly dabataseUserName: string;
```

- *Type:* string

---

##### `userCFNIdentifier`<sup>Required</sup> <a name="userCFNIdentifier" id="mongodb-atlas.DatabaseUserAttributes.property.userCFNIdentifier"></a>

```typescript
public readonly userCFNIdentifier: string;
```

- *Type:* string

---

### DatabaseUserOptions <a name="DatabaseUserOptions" id="mongodb-atlas.DatabaseUserOptions"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.DatabaseUserOptions.Initializer"></a>

```typescript
import { DatabaseUserOptions } from 'mongodb-atlas'

const databaseUserOptions: DatabaseUserOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.DatabaseUserOptions.property.awsiamType">awsiamType</a></code> | <code>awscdk-resources-mongodbatlas.CfnDatabaseUserPropsAwsiamType</code> | Human-readable label that indicates whether the new database user authenticates with the Amazon Web Services (AWS) Identity and Access Management (IAM) credentials associated with the user or the user's role. |
| <code><a href="#mongodb-atlas.DatabaseUserOptions.property.databaseName">databaseName</a></code> | <code>string</code> | MongoDB database against which the MongoDB database user authenticates. |
| <code><a href="#mongodb-atlas.DatabaseUserOptions.property.deleteAfterDate">deleteAfterDate</a></code> | <code>string</code> | Date and time when MongoDB Cloud deletes the user. |
| <code><a href="#mongodb-atlas.DatabaseUserOptions.property.labels">labels</a></code> | <code>awscdk-resources-mongodbatlas.LabelDefinition[]</code> | List that contains the key-value pairs for tagging and categorizing the MongoDB database user. |
| <code><a href="#mongodb-atlas.DatabaseUserOptions.property.ldapAuthType">ldapAuthType</a></code> | <code>awscdk-resources-mongodbatlas.CfnDatabaseUserPropsLdapAuthType</code> | Method by which the provided username is authenticated. |
| <code><a href="#mongodb-atlas.DatabaseUserOptions.property.password">password</a></code> | <code>string</code> | The user’s password. |
| <code><a href="#mongodb-atlas.DatabaseUserOptions.property.projectId">projectId</a></code> | <code>string</code> | Unique 24-hexadecimal digit string that identifies your Atlas Project. |
| <code><a href="#mongodb-atlas.DatabaseUserOptions.property.roles">roles</a></code> | <code>awscdk-resources-mongodbatlas.RoleDefinition[]</code> | List that provides the pairings of one role with one applicable database. |
| <code><a href="#mongodb-atlas.DatabaseUserOptions.property.scopes">scopes</a></code> | <code>awscdk-resources-mongodbatlas.ScopeDefinition[]</code> | List that contains clusters and MongoDB Atlas Data Lakes that this database user can access. |
| <code><a href="#mongodb-atlas.DatabaseUserOptions.property.username">username</a></code> | <code>string</code> | Human-readable label that represents the user that authenticates to MongoDB. |
| <code><a href="#mongodb-atlas.DatabaseUserOptions.property.x509Type">x509Type</a></code> | <code>awscdk-resources-mongodbatlas.CfnDatabaseUserPropsX509Type</code> | Method that briefs who owns the certificate provided. |

---

##### `awsiamType`<sup>Optional</sup> <a name="awsiamType" id="mongodb-atlas.DatabaseUserOptions.property.awsiamType"></a>

```typescript
public readonly awsiamType: CfnDatabaseUserPropsAwsiamType;
```

- *Type:* awscdk-resources-mongodbatlas.CfnDatabaseUserPropsAwsiamType

Human-readable label that indicates whether the new database user authenticates with the Amazon Web Services (AWS) Identity and Access Management (IAM) credentials associated with the user or the user's role.

Default value is `NONE`.

---

##### `databaseName`<sup>Optional</sup> <a name="databaseName" id="mongodb-atlas.DatabaseUserOptions.property.databaseName"></a>

```typescript
public readonly databaseName: string;
```

- *Type:* string

MongoDB database against which the MongoDB database user authenticates.

MongoDB database users must provide both a
username and authentication database to log into MongoDB.  Default value is `admin`.

---

##### `deleteAfterDate`<sup>Optional</sup> <a name="deleteAfterDate" id="mongodb-atlas.DatabaseUserOptions.property.deleteAfterDate"></a>

```typescript
public readonly deleteAfterDate: string;
```

- *Type:* string

Date and time when MongoDB Cloud deletes the user.

This parameter expresses its value in the ISO 8601 timestamp
format in UTC and can include the time zone designation. You must specify a future date that falls within one week
of making the Application Programming Interface (API) request.

---

##### `labels`<sup>Optional</sup> <a name="labels" id="mongodb-atlas.DatabaseUserOptions.property.labels"></a>

```typescript
public readonly labels: LabelDefinition[];
```

- *Type:* awscdk-resources-mongodbatlas.LabelDefinition[]
- *Default:* admin

List that contains the key-value pairs for tagging and categorizing the MongoDB database user.

The labels that you define
do not appear in the console.

---

##### `ldapAuthType`<sup>Optional</sup> <a name="ldapAuthType" id="mongodb-atlas.DatabaseUserOptions.property.ldapAuthType"></a>

```typescript
public readonly ldapAuthType: CfnDatabaseUserPropsLdapAuthType;
```

- *Type:* awscdk-resources-mongodbatlas.CfnDatabaseUserPropsLdapAuthType

Method by which the provided username is authenticated.

Default value is `NONE`.

---

##### `password`<sup>Optional</sup> <a name="password" id="mongodb-atlas.DatabaseUserOptions.property.password"></a>

```typescript
public readonly password: string;
```

- *Type:* string

The user’s password.

This field is not included in the entity returned from the server.

---

##### `projectId`<sup>Optional</sup> <a name="projectId" id="mongodb-atlas.DatabaseUserOptions.property.projectId"></a>

```typescript
public readonly projectId: string;
```

- *Type:* string

Unique 24-hexadecimal digit string that identifies your Atlas Project.

---

##### `roles`<sup>Optional</sup> <a name="roles" id="mongodb-atlas.DatabaseUserOptions.property.roles"></a>

```typescript
public readonly roles: RoleDefinition[];
```

- *Type:* awscdk-resources-mongodbatlas.RoleDefinition[]
- *Default:* [{ roleName: "atlasAdmin", databaseName: "admin" }],

List that provides the pairings of one role with one applicable database.

---

##### `scopes`<sup>Optional</sup> <a name="scopes" id="mongodb-atlas.DatabaseUserOptions.property.scopes"></a>

```typescript
public readonly scopes: ScopeDefinition[];
```

- *Type:* awscdk-resources-mongodbatlas.ScopeDefinition[]

List that contains clusters and MongoDB Atlas Data Lakes that this database user can access.

If omitted,
MongoDB Cloud grants the database user access to all the clusters and MongoDB Atlas Data Lakes in the project.

---

##### `username`<sup>Optional</sup> <a name="username" id="mongodb-atlas.DatabaseUserOptions.property.username"></a>

```typescript
public readonly username: string;
```

- *Type:* string
- *Default:* cdk-user

Human-readable label that represents the user that authenticates to MongoDB.

The format of this label depends on
the method of authentication. This will be USER_ARN or ROLE_ARN if AWSIAMType is USER or ROLE. Refer https://www.mongodb.com/docs/atlas/reference/api-resources-spec/#tag/Database-Users/operation/createDatabaseUser for details.

---

##### `x509Type`<sup>Optional</sup> <a name="x509Type" id="mongodb-atlas.DatabaseUserOptions.property.x509Type"></a>

```typescript
public readonly x509Type: CfnDatabaseUserPropsX509Type;
```

- *Type:* awscdk-resources-mongodbatlas.CfnDatabaseUserPropsX509Type

Method that briefs who owns the certificate provided.

Default value is `NONE`.

---

### DatabaseUserProps <a name="DatabaseUserProps" id="mongodb-atlas.DatabaseUserProps"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.DatabaseUserProps.Initializer"></a>

```typescript
import { DatabaseUserProps } from 'mongodb-atlas'

const databaseUserProps: DatabaseUserProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.account">account</a></code> | <code>string</code> | The AWS account ID this resource belongs to. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.environmentFromArn">environmentFromArn</a></code> | <code>string</code> | ARN to deduce region and account from. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.physicalName">physicalName</a></code> | <code>string</code> | The value passed in by users to the physical name prop of the resource. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.region">region</a></code> | <code>string</code> | The AWS region this resource belongs to. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.awsiamType">awsiamType</a></code> | <code>awscdk-resources-mongodbatlas.CfnDatabaseUserPropsAwsiamType</code> | Human-readable label that indicates whether the new database user authenticates with the Amazon Web Services (AWS) Identity and Access Management (IAM) credentials associated with the user or the user's role. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.databaseName">databaseName</a></code> | <code>string</code> | MongoDB database against which the MongoDB database user authenticates. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.deleteAfterDate">deleteAfterDate</a></code> | <code>string</code> | Date and time when MongoDB Cloud deletes the user. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.labels">labels</a></code> | <code>awscdk-resources-mongodbatlas.LabelDefinition[]</code> | List that contains the key-value pairs for tagging and categorizing the MongoDB database user. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.ldapAuthType">ldapAuthType</a></code> | <code>awscdk-resources-mongodbatlas.CfnDatabaseUserPropsLdapAuthType</code> | Method by which the provided username is authenticated. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.password">password</a></code> | <code>string</code> | The user’s password. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.projectId">projectId</a></code> | <code>string</code> | Unique 24-hexadecimal digit string that identifies your Atlas Project. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.roles">roles</a></code> | <code>awscdk-resources-mongodbatlas.RoleDefinition[]</code> | List that provides the pairings of one role with one applicable database. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.scopes">scopes</a></code> | <code>awscdk-resources-mongodbatlas.ScopeDefinition[]</code> | List that contains clusters and MongoDB Atlas Data Lakes that this database user can access. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.username">username</a></code> | <code>string</code> | Human-readable label that represents the user that authenticates to MongoDB. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.x509Type">x509Type</a></code> | <code>awscdk-resources-mongodbatlas.CfnDatabaseUserPropsX509Type</code> | Method that briefs who owns the certificate provided. |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.profile">profile</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.DatabaseUserProps.property.project">project</a></code> | <code><a href="#mongodb-atlas.IProject">IProject</a></code> | *No description.* |

---

##### `account`<sup>Optional</sup> <a name="account" id="mongodb-atlas.DatabaseUserProps.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string
- *Default:* the resource is in the same account as the stack it belongs to

The AWS account ID this resource belongs to.

---

##### `environmentFromArn`<sup>Optional</sup> <a name="environmentFromArn" id="mongodb-atlas.DatabaseUserProps.property.environmentFromArn"></a>

```typescript
public readonly environmentFromArn: string;
```

- *Type:* string
- *Default:* take environment from `account`, `region` parameters, or use Stack environment.

ARN to deduce region and account from.

The ARN is parsed and the account and region are taken from the ARN.
This should be used for imported resources.

Cannot be supplied together with either `account` or `region`.

---

##### `physicalName`<sup>Optional</sup> <a name="physicalName" id="mongodb-atlas.DatabaseUserProps.property.physicalName"></a>

```typescript
public readonly physicalName: string;
```

- *Type:* string
- *Default:* The physical name will be allocated by CloudFormation at deployment time

The value passed in by users to the physical name prop of the resource.

`undefined` implies that a physical name will be allocated by
  CloudFormation during deployment.
- a concrete value implies a specific physical name
- `PhysicalName.GENERATE_IF_NEEDED` is a marker that indicates that a physical will only be generated
  by the CDK if it is needed for cross-environment references. Otherwise, it will be allocated by CloudFormation.

---

##### `region`<sup>Optional</sup> <a name="region" id="mongodb-atlas.DatabaseUserProps.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string
- *Default:* the resource is in the same region as the stack it belongs to

The AWS region this resource belongs to.

---

##### `awsiamType`<sup>Optional</sup> <a name="awsiamType" id="mongodb-atlas.DatabaseUserProps.property.awsiamType"></a>

```typescript
public readonly awsiamType: CfnDatabaseUserPropsAwsiamType;
```

- *Type:* awscdk-resources-mongodbatlas.CfnDatabaseUserPropsAwsiamType

Human-readable label that indicates whether the new database user authenticates with the Amazon Web Services (AWS) Identity and Access Management (IAM) credentials associated with the user or the user's role.

Default value is `NONE`.

---

##### `databaseName`<sup>Optional</sup> <a name="databaseName" id="mongodb-atlas.DatabaseUserProps.property.databaseName"></a>

```typescript
public readonly databaseName: string;
```

- *Type:* string

MongoDB database against which the MongoDB database user authenticates.

MongoDB database users must provide both a
username and authentication database to log into MongoDB.  Default value is `admin`.

---

##### `deleteAfterDate`<sup>Optional</sup> <a name="deleteAfterDate" id="mongodb-atlas.DatabaseUserProps.property.deleteAfterDate"></a>

```typescript
public readonly deleteAfterDate: string;
```

- *Type:* string

Date and time when MongoDB Cloud deletes the user.

This parameter expresses its value in the ISO 8601 timestamp
format in UTC and can include the time zone designation. You must specify a future date that falls within one week
of making the Application Programming Interface (API) request.

---

##### `labels`<sup>Optional</sup> <a name="labels" id="mongodb-atlas.DatabaseUserProps.property.labels"></a>

```typescript
public readonly labels: LabelDefinition[];
```

- *Type:* awscdk-resources-mongodbatlas.LabelDefinition[]
- *Default:* admin

List that contains the key-value pairs for tagging and categorizing the MongoDB database user.

The labels that you define
do not appear in the console.

---

##### `ldapAuthType`<sup>Optional</sup> <a name="ldapAuthType" id="mongodb-atlas.DatabaseUserProps.property.ldapAuthType"></a>

```typescript
public readonly ldapAuthType: CfnDatabaseUserPropsLdapAuthType;
```

- *Type:* awscdk-resources-mongodbatlas.CfnDatabaseUserPropsLdapAuthType

Method by which the provided username is authenticated.

Default value is `NONE`.

---

##### `password`<sup>Optional</sup> <a name="password" id="mongodb-atlas.DatabaseUserProps.property.password"></a>

```typescript
public readonly password: string;
```

- *Type:* string

The user’s password.

This field is not included in the entity returned from the server.

---

##### `projectId`<sup>Optional</sup> <a name="projectId" id="mongodb-atlas.DatabaseUserProps.property.projectId"></a>

```typescript
public readonly projectId: string;
```

- *Type:* string

Unique 24-hexadecimal digit string that identifies your Atlas Project.

---

##### `roles`<sup>Optional</sup> <a name="roles" id="mongodb-atlas.DatabaseUserProps.property.roles"></a>

```typescript
public readonly roles: RoleDefinition[];
```

- *Type:* awscdk-resources-mongodbatlas.RoleDefinition[]
- *Default:* [{ roleName: "atlasAdmin", databaseName: "admin" }],

List that provides the pairings of one role with one applicable database.

---

##### `scopes`<sup>Optional</sup> <a name="scopes" id="mongodb-atlas.DatabaseUserProps.property.scopes"></a>

```typescript
public readonly scopes: ScopeDefinition[];
```

- *Type:* awscdk-resources-mongodbatlas.ScopeDefinition[]

List that contains clusters and MongoDB Atlas Data Lakes that this database user can access.

If omitted,
MongoDB Cloud grants the database user access to all the clusters and MongoDB Atlas Data Lakes in the project.

---

##### `username`<sup>Optional</sup> <a name="username" id="mongodb-atlas.DatabaseUserProps.property.username"></a>

```typescript
public readonly username: string;
```

- *Type:* string
- *Default:* cdk-user

Human-readable label that represents the user that authenticates to MongoDB.

The format of this label depends on
the method of authentication. This will be USER_ARN or ROLE_ARN if AWSIAMType is USER or ROLE. Refer https://www.mongodb.com/docs/atlas/reference/api-resources-spec/#tag/Database-Users/operation/createDatabaseUser for details.

---

##### `x509Type`<sup>Optional</sup> <a name="x509Type" id="mongodb-atlas.DatabaseUserProps.property.x509Type"></a>

```typescript
public readonly x509Type: CfnDatabaseUserPropsX509Type;
```

- *Type:* awscdk-resources-mongodbatlas.CfnDatabaseUserPropsX509Type

Method that briefs who owns the certificate provided.

Default value is `NONE`.

---

##### `profile`<sup>Required</sup> <a name="profile" id="mongodb-atlas.DatabaseUserProps.property.profile"></a>

```typescript
public readonly profile: string;
```

- *Type:* string

---

##### `project`<sup>Required</sup> <a name="project" id="mongodb-atlas.DatabaseUserProps.property.project"></a>

```typescript
public readonly project: IProject;
```

- *Type:* <a href="#mongodb-atlas.IProject">IProject</a>

---

### IpAccessListAttributes <a name="IpAccessListAttributes" id="mongodb-atlas.IpAccessListAttributes"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.IpAccessListAttributes.Initializer"></a>

```typescript
import { IpAccessListAttributes } from 'mongodb-atlas'

const ipAccessListAttributes: IpAccessListAttributes = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.IpAccessListAttributes.property.dabataseUserName">dabataseUserName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.IpAccessListAttributes.property.userCFNIdentifier">userCFNIdentifier</a></code> | <code>string</code> | *No description.* |

---

##### `dabataseUserName`<sup>Required</sup> <a name="dabataseUserName" id="mongodb-atlas.IpAccessListAttributes.property.dabataseUserName"></a>

```typescript
public readonly dabataseUserName: string;
```

- *Type:* string

---

##### `userCFNIdentifier`<sup>Required</sup> <a name="userCFNIdentifier" id="mongodb-atlas.IpAccessListAttributes.property.userCFNIdentifier"></a>

```typescript
public readonly userCFNIdentifier: string;
```

- *Type:* string

---

### IpAccessListOptions <a name="IpAccessListOptions" id="mongodb-atlas.IpAccessListOptions"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.IpAccessListOptions.Initializer"></a>

```typescript
import { IpAccessListOptions } from 'mongodb-atlas'

const ipAccessListOptions: IpAccessListOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.IpAccessListOptions.property.accessList">accessList</a></code> | <code>awscdk-resources-mongodbatlas.AccessListDefinition[]</code> | Access list definition. |
| <code><a href="#mongodb-atlas.IpAccessListOptions.property.listOptions">listOptions</a></code> | <code>awscdk-resources-mongodbatlas.ListOptions</code> | List options. |
| <code><a href="#mongodb-atlas.IpAccessListOptions.property.totalCount">totalCount</a></code> | <code>number</code> | Number of documents returned in this response. |

---

##### `accessList`<sup>Required</sup> <a name="accessList" id="mongodb-atlas.IpAccessListOptions.property.accessList"></a>

```typescript
public readonly accessList: AccessListDefinition[];
```

- *Type:* awscdk-resources-mongodbatlas.AccessListDefinition[]

Access list definition.

---

##### `listOptions`<sup>Optional</sup> <a name="listOptions" id="mongodb-atlas.IpAccessListOptions.property.listOptions"></a>

```typescript
public readonly listOptions: ListOptions;
```

- *Type:* awscdk-resources-mongodbatlas.ListOptions

List options.

---

##### `totalCount`<sup>Optional</sup> <a name="totalCount" id="mongodb-atlas.IpAccessListOptions.property.totalCount"></a>

```typescript
public readonly totalCount: number;
```

- *Type:* number

Number of documents returned in this response.

---

### IpAccessListProps <a name="IpAccessListProps" id="mongodb-atlas.IpAccessListProps"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.IpAccessListProps.Initializer"></a>

```typescript
import { IpAccessListProps } from 'mongodb-atlas'

const ipAccessListProps: IpAccessListProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.IpAccessListProps.property.account">account</a></code> | <code>string</code> | The AWS account ID this resource belongs to. |
| <code><a href="#mongodb-atlas.IpAccessListProps.property.environmentFromArn">environmentFromArn</a></code> | <code>string</code> | ARN to deduce region and account from. |
| <code><a href="#mongodb-atlas.IpAccessListProps.property.physicalName">physicalName</a></code> | <code>string</code> | The value passed in by users to the physical name prop of the resource. |
| <code><a href="#mongodb-atlas.IpAccessListProps.property.region">region</a></code> | <code>string</code> | The AWS region this resource belongs to. |
| <code><a href="#mongodb-atlas.IpAccessListProps.property.accessList">accessList</a></code> | <code>awscdk-resources-mongodbatlas.AccessListDefinition[]</code> | Access list definition. |
| <code><a href="#mongodb-atlas.IpAccessListProps.property.listOptions">listOptions</a></code> | <code>awscdk-resources-mongodbatlas.ListOptions</code> | List options. |
| <code><a href="#mongodb-atlas.IpAccessListProps.property.totalCount">totalCount</a></code> | <code>number</code> | Number of documents returned in this response. |
| <code><a href="#mongodb-atlas.IpAccessListProps.property.profile">profile</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.IpAccessListProps.property.project">project</a></code> | <code><a href="#mongodb-atlas.IProject">IProject</a></code> | *No description.* |

---

##### `account`<sup>Optional</sup> <a name="account" id="mongodb-atlas.IpAccessListProps.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string
- *Default:* the resource is in the same account as the stack it belongs to

The AWS account ID this resource belongs to.

---

##### `environmentFromArn`<sup>Optional</sup> <a name="environmentFromArn" id="mongodb-atlas.IpAccessListProps.property.environmentFromArn"></a>

```typescript
public readonly environmentFromArn: string;
```

- *Type:* string
- *Default:* take environment from `account`, `region` parameters, or use Stack environment.

ARN to deduce region and account from.

The ARN is parsed and the account and region are taken from the ARN.
This should be used for imported resources.

Cannot be supplied together with either `account` or `region`.

---

##### `physicalName`<sup>Optional</sup> <a name="physicalName" id="mongodb-atlas.IpAccessListProps.property.physicalName"></a>

```typescript
public readonly physicalName: string;
```

- *Type:* string
- *Default:* The physical name will be allocated by CloudFormation at deployment time

The value passed in by users to the physical name prop of the resource.

`undefined` implies that a physical name will be allocated by
  CloudFormation during deployment.
- a concrete value implies a specific physical name
- `PhysicalName.GENERATE_IF_NEEDED` is a marker that indicates that a physical will only be generated
  by the CDK if it is needed for cross-environment references. Otherwise, it will be allocated by CloudFormation.

---

##### `region`<sup>Optional</sup> <a name="region" id="mongodb-atlas.IpAccessListProps.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string
- *Default:* the resource is in the same region as the stack it belongs to

The AWS region this resource belongs to.

---

##### `accessList`<sup>Required</sup> <a name="accessList" id="mongodb-atlas.IpAccessListProps.property.accessList"></a>

```typescript
public readonly accessList: AccessListDefinition[];
```

- *Type:* awscdk-resources-mongodbatlas.AccessListDefinition[]

Access list definition.

---

##### `listOptions`<sup>Optional</sup> <a name="listOptions" id="mongodb-atlas.IpAccessListProps.property.listOptions"></a>

```typescript
public readonly listOptions: ListOptions;
```

- *Type:* awscdk-resources-mongodbatlas.ListOptions

List options.

---

##### `totalCount`<sup>Optional</sup> <a name="totalCount" id="mongodb-atlas.IpAccessListProps.property.totalCount"></a>

```typescript
public readonly totalCount: number;
```

- *Type:* number

Number of documents returned in this response.

---

##### `profile`<sup>Required</sup> <a name="profile" id="mongodb-atlas.IpAccessListProps.property.profile"></a>

```typescript
public readonly profile: string;
```

- *Type:* string

---

##### `project`<sup>Required</sup> <a name="project" id="mongodb-atlas.IpAccessListProps.property.project"></a>

```typescript
public readonly project: IProject;
```

- *Type:* <a href="#mongodb-atlas.IProject">IProject</a>

---

### PeeringProps <a name="PeeringProps" id="mongodb-atlas.PeeringProps"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.PeeringProps.Initializer"></a>

```typescript
import { PeeringProps } from 'mongodb-atlas'

const peeringProps: PeeringProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.PeeringProps.property.cidr">cidr</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.PeeringProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | *No description.* |
| <code><a href="#mongodb-atlas.PeeringProps.property.acceptRegionName">acceptRegionName</a></code> | <code>string</code> | The AWS region name to accept the peering. |
| <code><a href="#mongodb-atlas.PeeringProps.property.accountId">accountId</a></code> | <code>string</code> | The AWS account ID. |

---

##### `cidr`<sup>Required</sup> <a name="cidr" id="mongodb-atlas.PeeringProps.property.cidr"></a>

```typescript
public readonly cidr: string;
```

- *Type:* string

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="mongodb-atlas.PeeringProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

---

##### `acceptRegionName`<sup>Optional</sup> <a name="acceptRegionName" id="mongodb-atlas.PeeringProps.property.acceptRegionName"></a>

```typescript
public readonly acceptRegionName: string;
```

- *Type:* string
- *Default:* current region name.

The AWS region name to accept the peering.

---

##### `accountId`<sup>Optional</sup> <a name="accountId" id="mongodb-atlas.PeeringProps.property.accountId"></a>

```typescript
public readonly accountId: string;
```

- *Type:* string
- *Default:* current account ID.

The AWS account ID.

---

### ProjectAttributes <a name="ProjectAttributes" id="mongodb-atlas.ProjectAttributes"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.ProjectAttributes.Initializer"></a>

```typescript
import { ProjectAttributes } from 'mongodb-atlas'

const projectAttributes: ProjectAttributes = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.ProjectAttributes.property.projectId">projectId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.ProjectAttributes.property.projectName">projectName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.ProjectAttributes.property.projectOwnerId">projectOwnerId</a></code> | <code>string</code> | *No description.* |

---

##### `projectId`<sup>Required</sup> <a name="projectId" id="mongodb-atlas.ProjectAttributes.property.projectId"></a>

```typescript
public readonly projectId: string;
```

- *Type:* string

---

##### `projectName`<sup>Required</sup> <a name="projectName" id="mongodb-atlas.ProjectAttributes.property.projectName"></a>

```typescript
public readonly projectName: string;
```

- *Type:* string

---

##### `projectOwnerId`<sup>Required</sup> <a name="projectOwnerId" id="mongodb-atlas.ProjectAttributes.property.projectOwnerId"></a>

```typescript
public readonly projectOwnerId: string;
```

- *Type:* string

---

### ProjectOptions <a name="ProjectOptions" id="mongodb-atlas.ProjectOptions"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.ProjectOptions.Initializer"></a>

```typescript
import { ProjectOptions } from 'mongodb-atlas'

const projectOptions: ProjectOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.ProjectOptions.property.orgId">orgId</a></code> | <code>string</code> | Unique identifier of the organization within which to create the project. |
| <code><a href="#mongodb-atlas.ProjectOptions.property.clusterCount">clusterCount</a></code> | <code>number</code> | The number of Atlas clusters deployed in the project. |
| <code><a href="#mongodb-atlas.ProjectOptions.property.name">name</a></code> | <code>string</code> | Name of the project to create. |
| <code><a href="#mongodb-atlas.ProjectOptions.property.projectApiKeys">projectApiKeys</a></code> | <code>awscdk-resources-mongodbatlas.ProjectApiKey[]</code> | Project API key. |
| <code><a href="#mongodb-atlas.ProjectOptions.property.projectOwnerId">projectOwnerId</a></code> | <code>string</code> | Unique 24-hexadecimal digit string that identifies the Atlas user account to be granted the `Project Owner` role on the specified project. |
| <code><a href="#mongodb-atlas.ProjectOptions.property.projectSettings">projectSettings</a></code> | <code>awscdk-resources-mongodbatlas.ProjectSettings</code> | Project settings. |
| <code><a href="#mongodb-atlas.ProjectOptions.property.projectTeams">projectTeams</a></code> | <code>awscdk-resources-mongodbatlas.ProjectTeam[]</code> | Project team. |
| <code><a href="#mongodb-atlas.ProjectOptions.property.withDefaultAlertsSettings">withDefaultAlertsSettings</a></code> | <code>boolean</code> | Flag that indicates whether to create the project with default alert settings. |

---

##### `orgId`<sup>Required</sup> <a name="orgId" id="mongodb-atlas.ProjectOptions.property.orgId"></a>

```typescript
public readonly orgId: string;
```

- *Type:* string
- *Default:* auto-generated.

Unique identifier of the organization within which to create the project.

---

##### `clusterCount`<sup>Optional</sup> <a name="clusterCount" id="mongodb-atlas.ProjectOptions.property.clusterCount"></a>

```typescript
public readonly clusterCount: number;
```

- *Type:* number

The number of Atlas clusters deployed in the project.

---

##### `name`<sup>Optional</sup> <a name="name" id="mongodb-atlas.ProjectOptions.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string
- *Default:* auto-generated.

Name of the project to create.

---

##### `projectApiKeys`<sup>Optional</sup> <a name="projectApiKeys" id="mongodb-atlas.ProjectOptions.property.projectApiKeys"></a>

```typescript
public readonly projectApiKeys: ProjectApiKey[];
```

- *Type:* awscdk-resources-mongodbatlas.ProjectApiKey[]

Project API key.

---

##### `projectOwnerId`<sup>Optional</sup> <a name="projectOwnerId" id="mongodb-atlas.ProjectOptions.property.projectOwnerId"></a>

```typescript
public readonly projectOwnerId: string;
```

- *Type:* string

Unique 24-hexadecimal digit string that identifies the Atlas user account to be granted the `Project Owner` role on the specified project.

If you set this parameter, it overrides the default value of the oldest `Organization Owner`.

---

##### `projectSettings`<sup>Optional</sup> <a name="projectSettings" id="mongodb-atlas.ProjectOptions.property.projectSettings"></a>

```typescript
public readonly projectSettings: ProjectSettings;
```

- *Type:* awscdk-resources-mongodbatlas.ProjectSettings

Project settings.

---

##### `projectTeams`<sup>Optional</sup> <a name="projectTeams" id="mongodb-atlas.ProjectOptions.property.projectTeams"></a>

```typescript
public readonly projectTeams: ProjectTeam[];
```

- *Type:* awscdk-resources-mongodbatlas.ProjectTeam[]

Project team.

---

##### `withDefaultAlertsSettings`<sup>Optional</sup> <a name="withDefaultAlertsSettings" id="mongodb-atlas.ProjectOptions.property.withDefaultAlertsSettings"></a>

```typescript
public readonly withDefaultAlertsSettings: boolean;
```

- *Type:* boolean

Flag that indicates whether to create the project with default alert settings.

---

### ProjectProps <a name="ProjectProps" id="mongodb-atlas.ProjectProps"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.ProjectProps.Initializer"></a>

```typescript
import { ProjectProps } from 'mongodb-atlas'

const projectProps: ProjectProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.ProjectProps.property.account">account</a></code> | <code>string</code> | The AWS account ID this resource belongs to. |
| <code><a href="#mongodb-atlas.ProjectProps.property.environmentFromArn">environmentFromArn</a></code> | <code>string</code> | ARN to deduce region and account from. |
| <code><a href="#mongodb-atlas.ProjectProps.property.physicalName">physicalName</a></code> | <code>string</code> | The value passed in by users to the physical name prop of the resource. |
| <code><a href="#mongodb-atlas.ProjectProps.property.region">region</a></code> | <code>string</code> | The AWS region this resource belongs to. |
| <code><a href="#mongodb-atlas.ProjectProps.property.orgId">orgId</a></code> | <code>string</code> | Unique identifier of the organization within which to create the project. |
| <code><a href="#mongodb-atlas.ProjectProps.property.clusterCount">clusterCount</a></code> | <code>number</code> | The number of Atlas clusters deployed in the project. |
| <code><a href="#mongodb-atlas.ProjectProps.property.name">name</a></code> | <code>string</code> | Name of the project to create. |
| <code><a href="#mongodb-atlas.ProjectProps.property.projectApiKeys">projectApiKeys</a></code> | <code>awscdk-resources-mongodbatlas.ProjectApiKey[]</code> | Project API key. |
| <code><a href="#mongodb-atlas.ProjectProps.property.projectOwnerId">projectOwnerId</a></code> | <code>string</code> | Unique 24-hexadecimal digit string that identifies the Atlas user account to be granted the `Project Owner` role on the specified project. |
| <code><a href="#mongodb-atlas.ProjectProps.property.projectSettings">projectSettings</a></code> | <code>awscdk-resources-mongodbatlas.ProjectSettings</code> | Project settings. |
| <code><a href="#mongodb-atlas.ProjectProps.property.projectTeams">projectTeams</a></code> | <code>awscdk-resources-mongodbatlas.ProjectTeam[]</code> | Project team. |
| <code><a href="#mongodb-atlas.ProjectProps.property.withDefaultAlertsSettings">withDefaultAlertsSettings</a></code> | <code>boolean</code> | Flag that indicates whether to create the project with default alert settings. |
| <code><a href="#mongodb-atlas.ProjectProps.property.profile">profile</a></code> | <code>string</code> | *No description.* |

---

##### `account`<sup>Optional</sup> <a name="account" id="mongodb-atlas.ProjectProps.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string
- *Default:* the resource is in the same account as the stack it belongs to

The AWS account ID this resource belongs to.

---

##### `environmentFromArn`<sup>Optional</sup> <a name="environmentFromArn" id="mongodb-atlas.ProjectProps.property.environmentFromArn"></a>

```typescript
public readonly environmentFromArn: string;
```

- *Type:* string
- *Default:* take environment from `account`, `region` parameters, or use Stack environment.

ARN to deduce region and account from.

The ARN is parsed and the account and region are taken from the ARN.
This should be used for imported resources.

Cannot be supplied together with either `account` or `region`.

---

##### `physicalName`<sup>Optional</sup> <a name="physicalName" id="mongodb-atlas.ProjectProps.property.physicalName"></a>

```typescript
public readonly physicalName: string;
```

- *Type:* string
- *Default:* The physical name will be allocated by CloudFormation at deployment time

The value passed in by users to the physical name prop of the resource.

`undefined` implies that a physical name will be allocated by
  CloudFormation during deployment.
- a concrete value implies a specific physical name
- `PhysicalName.GENERATE_IF_NEEDED` is a marker that indicates that a physical will only be generated
  by the CDK if it is needed for cross-environment references. Otherwise, it will be allocated by CloudFormation.

---

##### `region`<sup>Optional</sup> <a name="region" id="mongodb-atlas.ProjectProps.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string
- *Default:* the resource is in the same region as the stack it belongs to

The AWS region this resource belongs to.

---

##### `orgId`<sup>Required</sup> <a name="orgId" id="mongodb-atlas.ProjectProps.property.orgId"></a>

```typescript
public readonly orgId: string;
```

- *Type:* string
- *Default:* auto-generated.

Unique identifier of the organization within which to create the project.

---

##### `clusterCount`<sup>Optional</sup> <a name="clusterCount" id="mongodb-atlas.ProjectProps.property.clusterCount"></a>

```typescript
public readonly clusterCount: number;
```

- *Type:* number

The number of Atlas clusters deployed in the project.

---

##### `name`<sup>Optional</sup> <a name="name" id="mongodb-atlas.ProjectProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string
- *Default:* auto-generated.

Name of the project to create.

---

##### `projectApiKeys`<sup>Optional</sup> <a name="projectApiKeys" id="mongodb-atlas.ProjectProps.property.projectApiKeys"></a>

```typescript
public readonly projectApiKeys: ProjectApiKey[];
```

- *Type:* awscdk-resources-mongodbatlas.ProjectApiKey[]

Project API key.

---

##### `projectOwnerId`<sup>Optional</sup> <a name="projectOwnerId" id="mongodb-atlas.ProjectProps.property.projectOwnerId"></a>

```typescript
public readonly projectOwnerId: string;
```

- *Type:* string

Unique 24-hexadecimal digit string that identifies the Atlas user account to be granted the `Project Owner` role on the specified project.

If you set this parameter, it overrides the default value of the oldest `Organization Owner`.

---

##### `projectSettings`<sup>Optional</sup> <a name="projectSettings" id="mongodb-atlas.ProjectProps.property.projectSettings"></a>

```typescript
public readonly projectSettings: ProjectSettings;
```

- *Type:* awscdk-resources-mongodbatlas.ProjectSettings

Project settings.

---

##### `projectTeams`<sup>Optional</sup> <a name="projectTeams" id="mongodb-atlas.ProjectProps.property.projectTeams"></a>

```typescript
public readonly projectTeams: ProjectTeam[];
```

- *Type:* awscdk-resources-mongodbatlas.ProjectTeam[]

Project team.

---

##### `withDefaultAlertsSettings`<sup>Optional</sup> <a name="withDefaultAlertsSettings" id="mongodb-atlas.ProjectProps.property.withDefaultAlertsSettings"></a>

```typescript
public readonly withDefaultAlertsSettings: boolean;
```

- *Type:* boolean

Flag that indicates whether to create the project with default alert settings.

---

##### `profile`<sup>Required</sup> <a name="profile" id="mongodb-atlas.ProjectProps.property.profile"></a>

```typescript
public readonly profile: string;
```

- *Type:* string

---

### RegionConfig <a name="RegionConfig" id="mongodb-atlas.RegionConfig"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.RegionConfig.Initializer"></a>

```typescript
import { RegionConfig } from 'mongodb-atlas'

const regionConfig: RegionConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.RegionConfig.property.analyticsSpecs">analyticsSpecs</a></code> | <code><a href="#mongodb-atlas.Specs">Specs</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.RegionConfig.property.electableSpecs">electableSpecs</a></code> | <code><a href="#mongodb-atlas.Specs">Specs</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.RegionConfig.property.priority">priority</a></code> | <code>number</code> | *No description.* |
| <code><a href="#mongodb-atlas.RegionConfig.property.regionName">regionName</a></code> | <code>string</code> | *No description.* |

---

##### `analyticsSpecs`<sup>Required</sup> <a name="analyticsSpecs" id="mongodb-atlas.RegionConfig.property.analyticsSpecs"></a>

```typescript
public readonly analyticsSpecs: Specs;
```

- *Type:* <a href="#mongodb-atlas.Specs">Specs</a>

---

##### `electableSpecs`<sup>Required</sup> <a name="electableSpecs" id="mongodb-atlas.RegionConfig.property.electableSpecs"></a>

```typescript
public readonly electableSpecs: Specs;
```

- *Type:* <a href="#mongodb-atlas.Specs">Specs</a>

---

##### `priority`<sup>Required</sup> <a name="priority" id="mongodb-atlas.RegionConfig.property.priority"></a>

```typescript
public readonly priority: number;
```

- *Type:* number

---

##### `regionName`<sup>Required</sup> <a name="regionName" id="mongodb-atlas.RegionConfig.property.regionName"></a>

```typescript
public readonly regionName: string;
```

- *Type:* string

---

### ReplicationSpecs <a name="ReplicationSpecs" id="mongodb-atlas.ReplicationSpecs"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.ReplicationSpecs.Initializer"></a>

```typescript
import { ReplicationSpecs } from 'mongodb-atlas'

const replicationSpecs: ReplicationSpecs = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.ReplicationSpecs.property.advancedRegionConfigs">advancedRegionConfigs</a></code> | <code><a href="#mongodb-atlas.RegionConfig">RegionConfig</a>[]</code> | *No description.* |
| <code><a href="#mongodb-atlas.ReplicationSpecs.property.numShards">numShards</a></code> | <code>number</code> | *No description.* |

---

##### `advancedRegionConfigs`<sup>Required</sup> <a name="advancedRegionConfigs" id="mongodb-atlas.ReplicationSpecs.property.advancedRegionConfigs"></a>

```typescript
public readonly advancedRegionConfigs: RegionConfig[];
```

- *Type:* <a href="#mongodb-atlas.RegionConfig">RegionConfig</a>[]

---

##### `numShards`<sup>Required</sup> <a name="numShards" id="mongodb-atlas.ReplicationSpecs.property.numShards"></a>

```typescript
public readonly numShards: number;
```

- *Type:* number

---

### Specs <a name="Specs" id="mongodb-atlas.Specs"></a>

#### Initializer <a name="Initializer" id="mongodb-atlas.Specs.Initializer"></a>

```typescript
import { Specs } from 'mongodb-atlas'

const specs: Specs = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.Specs.property.ebsVolumeType">ebsVolumeType</a></code> | <code><a href="#mongodb-atlas.EbsVolumeType">EbsVolumeType</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.Specs.property.instanceSize">instanceSize</a></code> | <code><a href="#mongodb-atlas.InstanceSize">InstanceSize</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.Specs.property.nodeCount">nodeCount</a></code> | <code>number</code> | *No description.* |

---

##### `ebsVolumeType`<sup>Required</sup> <a name="ebsVolumeType" id="mongodb-atlas.Specs.property.ebsVolumeType"></a>

```typescript
public readonly ebsVolumeType: EbsVolumeType;
```

- *Type:* <a href="#mongodb-atlas.EbsVolumeType">EbsVolumeType</a>

---

##### `instanceSize`<sup>Required</sup> <a name="instanceSize" id="mongodb-atlas.Specs.property.instanceSize"></a>

```typescript
public readonly instanceSize: InstanceSize;
```

- *Type:* <a href="#mongodb-atlas.InstanceSize">InstanceSize</a>

---

##### `nodeCount`<sup>Required</sup> <a name="nodeCount" id="mongodb-atlas.Specs.property.nodeCount"></a>

```typescript
public readonly nodeCount: number;
```

- *Type:* number

---

## Classes <a name="Classes" id="Classes"></a>

### MongoDBAtlasBootstrapProps <a name="MongoDBAtlasBootstrapProps" id="mongodb-atlas.MongoDBAtlasBootstrapProps"></a>

#### Initializers <a name="Initializers" id="mongodb-atlas.MongoDBAtlasBootstrapProps.Initializer"></a>

```typescript
import { MongoDBAtlasBootstrapProps } from 'mongodb-atlas'

new MongoDBAtlasBootstrapProps()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrapProps.property.roleName">roleName</a></code> | <code>string</code> | The IAM role name for CloudFormation Extension Execution. |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrapProps.property.secretProfile">secretProfile</a></code> | <code>string</code> | The secret profile name for MongoDB Atlas. |

---

##### `roleName`<sup>Optional</sup> <a name="roleName" id="mongodb-atlas.MongoDBAtlasBootstrapProps.property.roleName"></a>

```typescript
public readonly roleName: string;
```

- *Type:* string
- *Default:* auto generat the name.

The IAM role name for CloudFormation Extension Execution.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html)

---

##### `secretProfile`<sup>Optional</sup> <a name="secretProfile" id="mongodb-atlas.MongoDBAtlasBootstrapProps.property.secretProfile"></a>

```typescript
public readonly secretProfile: string;
```

- *Type:* string
- *Default:* generate a dummy secret.

The secret profile name for MongoDB Atlas.

> [https://github.com/mongodb/mongodbatlas-cloudformation-resources/tree/master#2-configure-your-profile](https://github.com/mongodb/mongodbatlas-cloudformation-resources/tree/master#2-configure-your-profile)

---


## Protocols <a name="Protocols" id="Protocols"></a>

### ICluster <a name="ICluster" id="mongodb-atlas.ICluster"></a>

- *Implemented By:* <a href="#mongodb-atlas.Cluster">Cluster</a>, <a href="#mongodb-atlas.ICluster">ICluster</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.ICluster.property.clusterId">clusterId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.ICluster.property.clusterName">clusterName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.ICluster.property.createdDate">createdDate</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.ICluster.property.mongoDBVersion">mongoDBVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.ICluster.property.stateName">stateName</a></code> | <code>string</code> | *No description.* |

---

##### `clusterId`<sup>Required</sup> <a name="clusterId" id="mongodb-atlas.ICluster.property.clusterId"></a>

```typescript
public readonly clusterId: string;
```

- *Type:* string

---

##### `clusterName`<sup>Required</sup> <a name="clusterName" id="mongodb-atlas.ICluster.property.clusterName"></a>

```typescript
public readonly clusterName: string;
```

- *Type:* string

---

##### `createdDate`<sup>Optional</sup> <a name="createdDate" id="mongodb-atlas.ICluster.property.createdDate"></a>

```typescript
public readonly createdDate: string;
```

- *Type:* string

---

##### `mongoDBVersion`<sup>Optional</sup> <a name="mongoDBVersion" id="mongodb-atlas.ICluster.property.mongoDBVersion"></a>

```typescript
public readonly mongoDBVersion: string;
```

- *Type:* string

---

##### `stateName`<sup>Optional</sup> <a name="stateName" id="mongodb-atlas.ICluster.property.stateName"></a>

```typescript
public readonly stateName: string;
```

- *Type:* string

---

### IDatabaseUser <a name="IDatabaseUser" id="mongodb-atlas.IDatabaseUser"></a>

- *Implemented By:* <a href="#mongodb-atlas.DatabaseUser">DatabaseUser</a>, <a href="#mongodb-atlas.IDatabaseUser">IDatabaseUser</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.IDatabaseUser.property.dabataseUserName">dabataseUserName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.IDatabaseUser.property.userCFNIdentifier">userCFNIdentifier</a></code> | <code>string</code> | *No description.* |

---

##### `dabataseUserName`<sup>Required</sup> <a name="dabataseUserName" id="mongodb-atlas.IDatabaseUser.property.dabataseUserName"></a>

```typescript
public readonly dabataseUserName: string;
```

- *Type:* string

---

##### `userCFNIdentifier`<sup>Required</sup> <a name="userCFNIdentifier" id="mongodb-atlas.IDatabaseUser.property.userCFNIdentifier"></a>

```typescript
public readonly userCFNIdentifier: string;
```

- *Type:* string

---

### IIpAccessList <a name="IIpAccessList" id="mongodb-atlas.IIpAccessList"></a>

- *Extends:* aws-cdk-lib.IResource

- *Implemented By:* <a href="#mongodb-atlas.IpAccessList">IpAccessList</a>, <a href="#mongodb-atlas.IIpAccessList">IIpAccessList</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.IIpAccessList.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#mongodb-atlas.IIpAccessList.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#mongodb-atlas.IIpAccessList.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |

---

##### `node`<sup>Required</sup> <a name="node" id="mongodb-atlas.IIpAccessList.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="mongodb-atlas.IIpAccessList.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="mongodb-atlas.IIpAccessList.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

### IProject <a name="IProject" id="mongodb-atlas.IProject"></a>

- *Implemented By:* <a href="#mongodb-atlas.Project">Project</a>, <a href="#mongodb-atlas.IProject">IProject</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.IProject.property.projectId">projectId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.IProject.property.projectName">projectName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.IProject.property.projectOwnerId">projectOwnerId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.IProject.property.clusterCount">clusterCount</a></code> | <code>number</code> | *No description.* |
| <code><a href="#mongodb-atlas.IProject.property.created">created</a></code> | <code>string</code> | *No description.* |

---

##### `projectId`<sup>Required</sup> <a name="projectId" id="mongodb-atlas.IProject.property.projectId"></a>

```typescript
public readonly projectId: string;
```

- *Type:* string

---

##### `projectName`<sup>Required</sup> <a name="projectName" id="mongodb-atlas.IProject.property.projectName"></a>

```typescript
public readonly projectName: string;
```

- *Type:* string

---

##### `projectOwnerId`<sup>Required</sup> <a name="projectOwnerId" id="mongodb-atlas.IProject.property.projectOwnerId"></a>

```typescript
public readonly projectOwnerId: string;
```

- *Type:* string

---

##### `clusterCount`<sup>Optional</sup> <a name="clusterCount" id="mongodb-atlas.IProject.property.clusterCount"></a>

```typescript
public readonly clusterCount: number;
```

- *Type:* number

---

##### `created`<sup>Optional</sup> <a name="created" id="mongodb-atlas.IProject.property.created"></a>

```typescript
public readonly created: string;
```

- *Type:* string

---

## Enums <a name="Enums" id="Enums"></a>

### AwsRegion <a name="AwsRegion" id="mongodb-atlas.AwsRegion"></a>

supported AWS regions.

> [https://www.mongodb.com/docs/atlas/reference/amazon-aws/](https://www.mongodb.com/docs/atlas/reference/amazon-aws/)

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.AwsRegion.US_EAST_1">US_EAST_1</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.AwsRegion.US_WEST_2">US_WEST_2</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.AwsRegion.CA_CENTRAL_1">CA_CENTRAL_1</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.AwsRegion.US_EAST_2">US_EAST_2</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.AwsRegion.US_WEST_1">US_WEST_1</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.AwsRegion.SA_EAST_1">SA_EAST_1</a></code> | *No description.* |

---

##### `US_EAST_1` <a name="US_EAST_1" id="mongodb-atlas.AwsRegion.US_EAST_1"></a>

---


##### `US_WEST_2` <a name="US_WEST_2" id="mongodb-atlas.AwsRegion.US_WEST_2"></a>

---


##### `CA_CENTRAL_1` <a name="CA_CENTRAL_1" id="mongodb-atlas.AwsRegion.CA_CENTRAL_1"></a>

---


##### `US_EAST_2` <a name="US_EAST_2" id="mongodb-atlas.AwsRegion.US_EAST_2"></a>

---


##### `US_WEST_1` <a name="US_WEST_1" id="mongodb-atlas.AwsRegion.US_WEST_1"></a>

---


##### `SA_EAST_1` <a name="SA_EAST_1" id="mongodb-atlas.AwsRegion.SA_EAST_1"></a>

---


### ClusterType <a name="ClusterType" id="mongodb-atlas.ClusterType"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.ClusterType.REPLICASET">REPLICASET</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.ClusterType.SHARDED">SHARDED</a></code> | *No description.* |
| <code><a href="#mongodb-atlas.ClusterType.GEOSHARDED">GEOSHARDED</a></code> | *No description.* |

---

##### `REPLICASET` <a name="REPLICASET" id="mongodb-atlas.ClusterType.REPLICASET"></a>

---


##### `SHARDED` <a name="SHARDED" id="mongodb-atlas.ClusterType.SHARDED"></a>

---


##### `GEOSHARDED` <a name="GEOSHARDED" id="mongodb-atlas.ClusterType.GEOSHARDED"></a>

---


### EbsVolumeType <a name="EbsVolumeType" id="mongodb-atlas.EbsVolumeType"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.EbsVolumeType.STANDARD">STANDARD</a></code> | *No description.* |

---

##### `STANDARD` <a name="STANDARD" id="mongodb-atlas.EbsVolumeType.STANDARD"></a>

---


### InstanceSize <a name="InstanceSize" id="mongodb-atlas.InstanceSize"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.InstanceSize.M10">M10</a></code> | *No description.* |

---

##### `M10` <a name="M10" id="mongodb-atlas.InstanceSize.M10"></a>

---

