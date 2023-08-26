import * as path from 'path';
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import {
  App, Stack,
  aws_ec2 as ec2,
  aws_lambda as lambda,
  aws_apigateway as apigw,
  Duration,
} from 'aws-cdk-lib';
import {
  MongoDBAtlasBootstrap, AtlasCluster, ReplicationSpecs, EbsVolumeType, InstanceSize, AwsRegion,
  ClusterType, getVpc, AtlasCfnType,
} from './index';

const app = new App();
const env = { region: process.env.CDK_DEFAULT_REGION, account: process.env.CDK_DEFAULT_ACCOUNT };
const bootstrapStack = new Stack(app, 'mongo-cdk-bootstrap', { env });
const demoStack = new Stack(app, 'mongodb-demo-stack', { env });

const secretProfile = 'my-mongo-profile';
// bootstrap by creating the cfn extension execution role and profile secret.
new MongoDBAtlasBootstrap(bootstrapStack, 'mongoCdkBootstrap', {
  roleName: 'cfn-ext-exec-role-for-mongo',
  secretProfile,
  typesToActivate: [
    AtlasCfnType.CLUSTER,
    AtlasCfnType.PROJECT,
    AtlasCfnType.DATABASE_USER,
    AtlasCfnType.PROJECT_IP_ACCESS_LIST,
    AtlasCfnType.NETWORK_CONTAINER,
    AtlasCfnType.NETWORK_PEERING,
    AtlasCfnType.SERVERLESS_INSTANCE,
  ],
});

const replication: ReplicationSpecs[] = [
  {
    numShards: 1,
    advancedRegionConfigs: [
      {
        analyticsSpecs: {
          ebsVolumeType: EbsVolumeType.STANDARD,
          instanceSize: InstanceSize.M10,
          nodeCount: 1,
        },
        electableSpecs: {
          ebsVolumeType: EbsVolumeType.STANDARD,
          instanceSize: InstanceSize.M10,
          nodeCount: 3,
        },
        priority: 7,
        regionName: AwsRegion.US_EAST_1,
      },
    ],
  },
];

const vpc = getVpc(demoStack);
const orgId = process.env.MONGODB_ATLAS_ORG_ID || 'mock_id';

// create the ReplicaSet cluster
const cluster = new AtlasCluster(demoStack, 'Cluster', {
  clusterName: 'my-cluster',
  orgId,
  profile: secretProfile,
  replication,
  accessList: [
    { ipAddress: vpc.vpcCidrBlock, comment: 'allow from my VPC only' },
    // { ipAddress: '0.0.0.0/0', comment: 'allow all' },
  ],
  clusterType: ClusterType.REPLICASET,
});

// add a private endpoint for it
cluster.addPrivateEndpoint({
  vpc,
  vpcSubnets: [
    { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, onePerAz: true },
  ],
});

// or with VPC peering:
// cluster.addVpcPeering({ vpc, cidr: "192.168.248.0/21" });

// The demo lambda function.
const handler = new PythonFunction(demoStack, 'LambdaFunc', {
  entry: path.join(__dirname, '../lambda/playground'),
  runtime: lambda.Runtime.PYTHON_3_10,
  handler: 'handler',
  index: 'index.py',
  timeout: Duration.seconds(30),
  vpc,
  // securityGroups: [
  //   SecurityGroup.fromLookupByName(demoStack, 'defaultSG', 'default', vpc),
  // ],
  environment: {
    CONN_STRING_STANDARD: cluster.connectionStrings.standardSrv!,
    DB_USER_SECRET_ARN: cluster.databaseUser.secret.secretArn,
  },
});

// allow the handler to read the db user secret
cluster.databaseUser.secret.grantRead(handler);

// create the API Gateway API with the lambda handler.
new apigw.LambdaRestApi(demoStack, 'RestAPI', { handler });

