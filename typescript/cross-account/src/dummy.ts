import {
    Stack, StackProps,
		aws_sqs as sqs,
} from 'aws-cdk-lib'
import { Construct } from 'constructs';

export class DummyStack extends Stack {
	constructor(scope: Construct, id: string, props: StackProps = {}) {
		super(scope, id, props);

		// let's just create a SQS Queue
		new sqs.Queue(this, 'DummyQueue');
    }
}