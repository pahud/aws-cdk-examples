import { App, Stack } from 'aws-cdk-lib';
import { MongoDBAtlasBootstrap } from './bootstrap';
import { DemoStack } from './demo-stack';


const app = new App();
const env = { region: process.env.CDK_DEFAULT_REGION, account: process.env.CDK_DEFAULT_ACCOUNT };
const bootstrapStack = new Stack(app, 'mongo-cdk-bootstrap', { env });

const secretProfile = 'my-mongo-profile';
// bootstrap by creating the cfn extension execution role and profile secret.
new MongoDBAtlasBootstrap(bootstrapStack, 'mongoCdkBootstrap', {
  roleName: 'cfn-ext-exec-role-for-mongo',
  secretProfile,
});

new DemoStack(app, 'mongodb-demo-stack', {
  secretProfile,
  orgId: process.env.MONGODB_ATLAS_ORG_ID || 'mock_id',
});

// export class IntegTesting {
//   readonly stack: Stack[];
//   constructor() {
//     const app = new App();
//     const env = { region: process.env.CDK_DEFAULT_REGION, account: process.env.CDK_DEFAULT_ACCOUNT };
//     const bootstrapStack = new Stack(app, 'mongo-cdk-bootstrap', { env });

//     const secretProfile = 'my-mongo-profile';
//     // bootstrap by creating the cfn extension execution role and profile secret.
//     new MongoDBAtlasBootstrap(bootstrapStack, 'mongoCdkBootstrap', {
//       roleName: 'cfn-ext-exec-role-for-mongo',
//       secretProfile,
//     });

//     const demoStack = new DemoStack(app, 'mongodb-demo-stack', {
//       secretProfile,
//       orgId: process.env.MONGODB_ATLAS_ORG_ID || 'mock_id',
//     });
//     this.stack = [bootstrapStack, demoStack];
//   };
// };

// new IntegTesting();