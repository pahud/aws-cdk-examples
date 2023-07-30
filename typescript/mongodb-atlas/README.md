# MongoDB Atlas with CDK

This example walks you through building MongoDB Atlas cluster with AWS CDK.

<img src=./images/diagram.svg>

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
(You will need to activate `MongoDB::Atlas::Cluster`, `MongoDB::Atlas::DatabaseUser`, `MongoDB::Atlas::Project` and `MongoDB::Atlas::ProjectIpAccessList`)

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

# Create the Cluster

Let's deploy the `DemoStack` that creates the cluster with the `AtlasBasic` L3 construct. You can view the source of `DemoStack` in [demo-stack.ts](./src/demo-stack.ts).

```sh
$ MONGODB_ATLAS_ORG_ID='your_org_id' npx cdk deploy mongodb-demo-stack
```

Alternatively, you can update the `demo-stack.ts` by specifying your orgId in the construct property:


```ts
new DemoStack(app, 'mongodb-demo-stack', {
  secretProfile,
  orgId: 'your_org_id',
});
```

On deployment completed, you should be able to see a standard cluster in your MongoDB Atlas console in the relevant organization and project.

<img src=./images/cluster.png>

# clean up

destroy the cluster:

```sh
$ npx cdk destroy mongodb-demo-stack
```

destroy the bootstrap stack(cloudformation execution role and secret):

```sh
$ npx cdk destroy mongo-cdk-bootstrap
```


# FAQ
**Question: Should I add the billing method before I am allowed to create the cluster?**

Answer: Yes you have to add a default billing method in the MongoDB Atlas console.

**Question: Do I always need to deploy bootstrap stack for every cluster creation?**

Answer: No, the goal of the bootstrap stack is to create a shared cloudformation extension execution role and secret for public and private keys. You don't need to re-bootstrap for additional clusters if you are using the same key pair. However, if you have to use different key pair, you will need to create a different Secret and grant the read to the cloudformation extension execution role. Check out [bootstrap.ts](./src/bootstrap.ts) for more details.

