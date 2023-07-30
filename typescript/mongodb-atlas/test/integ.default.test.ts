import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { MongoDBAtlasBootstrap } from '../src/bootstrap';
import { DemoStack } from '../src/demo-stack';

test('default validation', () => {
  const app = new App();
  const bootstrapStack = new Stack(app, 'mongo-cdk-bootstrap');

  const secretProfile = 'my-mongo-profile';
  // bootstrap by creating the cfn extension execution role and profile secret.
  new MongoDBAtlasBootstrap(bootstrapStack, 'mongoCdkBootstrap', {
    roleName: 'cfn-ext-exec-role-for-mongo',
    secretProfile,
  });

  const demoStack = new DemoStack(app, 'mongodb-demo-stack', {
    secretProfile,
    orgId: process.env.MONGODB_ATLAS_ORG_ID || 'mock_id',
  });

  [bootstrapStack, demoStack].forEach(stack => {
    const t = Template.fromStack(stack);
    // should match snapshot
    expect(t).toMatchSnapshot();
  });
});