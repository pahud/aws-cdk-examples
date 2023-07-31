import {
  App, Stack,
  aws_ec2 as ec2,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MongoDBAtlasBootstrap } from './bootstrap';
import { Demo } from './demo';


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

new Demo(demoStack, 'mongodb-demo', {
  secretProfile,
  orgId: process.env.MONGODB_ATLAS_ORG_ID || 'mock_id',
  region: 'US_EAST_1',
  peering: {
    vpc: getVpc(demoStack),
    atlasCidr: '192.168.248.0/21',
  },
});


function getVpc(scope: Construct): ec2.IVpc {
  return scope.node.tryGetContext('use_default_vpc') === '1' ?
    ec2.Vpc.fromLookup(scope, 'Vpc', { isDefault: true }) :
    scope.node.tryGetContext('use_vpc_id') != undefined ?
      ec2.Vpc.fromLookup(scope, 'Vpc', { vpcId: scope.node.tryGetContext('use_vpc_id') }) :
      new ec2.Vpc(scope, 'Vpc', { natGateways: 1 });
}