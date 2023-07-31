import {
  App, Stack,
  aws_ec2 as ec2,
} from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { MongoDBAtlasBootstrap } from '../src/bootstrap';
import { Demo } from '../src/demo';

test('default validation', () => {
  const app = new App();
  const bootstrapStack = new Stack(app, 'mongo-cdk-bootstrap');
  const demoStack = new Stack(app, 'mongodb-demo-stack');


  const secretProfile = 'my-mongo-profile';
  // bootstrap by creating the cfn extension execution role and profile secret.
  new MongoDBAtlasBootstrap(bootstrapStack, 'mongoCdkBootstrap', {
    roleName: 'cfn-ext-exec-role-for-mongo',
    secretProfile,
  });

  new Demo(demoStack, 'mongodb-demo-stack', {
    secretProfile,
    orgId: process.env.MONGODB_ATLAS_ORG_ID || 'mock_id',
    region: 'US_EAST_1',
    peering: {
      vpc: new ec2.Vpc(demoStack, 'Vpc', { natGateways: 1 }),
      atlasCidr: '192.168.248.0/21',
    },
  });

  [bootstrapStack, demoStack].forEach(stack => {
    const t = Template.fromStack(stack);
    // should match snapshot
    expect(t).toMatchSnapshot();
  });
});