import { App, Stack, StackProps, pipelines, Stage, StageProps,
    aws_sqs as sqs
} from 'aws-cdk-lib'; 
import { Construct } from 'constructs';

// define Account A and B
const accountA = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const accountB = {
  account: '222222222222',
  region: 'us-west-2'
};

class QueueStack extends Stack {
	constructor(scope: Construct, id: string) {
		super(scope, id);
		new sqs.Queue(this, 'DummyQueue');
	}
}
  
/**
 * Stack to hold the pipeline on Account A
 */
class MyPipelineStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
			// Encrypt artifacts, required for cross-account deployments
			crossAccountKeys: true,
			synth: new pipelines.ShellStep('Synth', {
				// Use a connection created using the AWS console to authenticate to GitHub
				// Other sources are available.
				input: pipelines.CodePipelineSource.connection('pahud/cdk-pipeline-sample', 'main', {
					connectionArn: 'arn:aws:codestar-connections:us-east-1:111111111111:connection/4ce07986-eeed-48c1-9c27-adee4931ffef', // Created using the AWS console * });',
				}),
				commands: [
					// 'npm ci',
					'yarn install --frozen-lockfile',
					// 'yarn build',
					'npx cdk synth',
				],
			}),
		});

		// 'MyApplication' is defined below. Call `addStage` as many times as
		// necessary with any account and region (may be different from the
		// pipeline's). In this example, we are deploying the application to Account B.
		pipeline.addStage(new MyApplication(this, 'Prod', {
			env: {
				account: accountB.account,
				region: accountB.region,
			},
		}));
	}
}

/**
 * Your application
 */
class MyApplication extends Stage {
	constructor(scope: Construct, id: string, props?: StageProps) {
		super(scope, id, props);

		new QueueStack(this, 'Queue')

	}
}

const app = new App();

// deploy the pipeline in Account A
new MyPipelineStack(app, 'PipelineStack', {
	env: {
		account: accountA.account,
		region: accountA.region,
	}
});