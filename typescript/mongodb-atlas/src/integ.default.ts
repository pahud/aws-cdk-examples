import * as path from 'path';
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import {
  App, Stack, SecretValue,
  aws_lambda as lambda,
  aws_apigateway as apigw,
  aws_secretsmanager as secretsmanager,
  CfnOutput,
} from 'aws-cdk-lib';
import {
  MongoDBAtlasBootstrap, AtlasCluster, ServerlessInstance, ReplicationSpecs, EbsVolumeType, InstanceSize, AwsRegion,
  ClusterType, getVpc,
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
    // { ipAddress: vpc.vpcCidrBlock, comment: 'allow from my VPC only' },
    { ipAddress: '0.0.0.0/0', comment: 'allow all' },
  ],
  peering: { vpc, cidr: '192.168.248.0/21' },
  clusterType: ClusterType.REPLICASET,
});

// create a serverless instance
new ServerlessInstance(demoStack, 'ServerlessInstance', {
  orgId,
  instanceName: 'my-serverless-instance',
  profile: secretProfile,
  project: cluster.project,
  continuousBackup: true,
});

/**
 * Create a secret to store the connection string and password.
 * Lambda function will retrieve this secret for the connection string and
 * connect to the MongoDB.
 */
const connectionStringSecret = new secretsmanager.Secret(demoStack, 'ConnectionStringSecret', {
  secretName: 'cfn/atlas/connectionString/default',
  secretStringValue: SecretValue.unsafePlainText('changeMe'),
});
new CfnOutput(demoStack, 'ConnectionStringSecretName', { value: connectionStringSecret.secretName });

// The demo lambda function.
const handler = new PythonFunction(demoStack, 'LambdaFunc', {
  entry: path.join(__dirname, '../lambda/playground'),
  runtime: lambda.Runtime.PYTHON_3_10,
  handler: 'handler',
  index: 'index.py',
  vpc,
  environment: {
    CONN_STRING_SECRET: connectionStringSecret.secretArn,
  },
});

// allow the lambda to read the connection string secret
connectionStringSecret.grantRead(handler);

// create the API Gateway API with the lambda handler.
new apigw.LambdaRestApi(demoStack, 'RestAPI', { handler });

