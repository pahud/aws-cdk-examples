import { App, Stack } from 'aws-cdk-lib';
import { MongoDBAtlasBootstrap } from './bootstrap';
import { DemoStack } from './demo-stack';

export class IntegTesting {
  readonly stack: Stack[];
  constructor() {
    const app = new App();
    const env = { region: process.env.CDK_DEFAULT_REGION, account: process.env.CDK_DEFAULT_ACCOUNT };
    const bootstrapStack = new Stack(app, 'mongo-cdk-bootstrap', { env });

    // bootstrap by creating the cfn extension execution role and profile secret.
    const bootstrap = new MongoDBAtlasBootstrap(bootstrapStack, 'mongoCdkBootstrap', {
      roleName: 'cfn-ext-exec-role-for-mongo',
      secretProfile: 'my-mongo-profile',
    });

    const demoStack = new DemoStack(app, 'mongodb-demo-stack', {
      profile: bootstrap.profile,
    });
    this.stack = [bootstrapStack, demoStack];
  }
};

new IntegTesting();