import { App, Stack, StackProps, 
  aws_sqs as sqs } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

		// let's just create a SQS Queue
		new sqs.Queue(this, 'DummyQueue');
  }
}

// for development, use account/region from cdk cli
// const accountA = {
//   account: process.env.CDK_DEFAULT_ACCOUNT,
//   region: process.env.CDK_DEFAULT_REGION,
// };


// for production, use account/region from cdk cli
const accountB = {
  account: '222222222222',
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'cdk-cross-account-dev', { env: accountB });

app.synth();