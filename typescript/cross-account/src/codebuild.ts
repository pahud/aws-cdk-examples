import { App, Stack, StackProps, CfnOutput, 
aws_codebuild as codebuild,
aws_iam as iam, } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export class DummyStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
      super(scope, id, props);
  
      const project = new codebuild.Project(this, 'Project', {
        source: codebuild.Source.gitHub({
          owner: 'pahud',
          repo: 'cdk-dummy-app',
        }),
        buildSpec: codebuild.BuildSpec.fromAsset(path.join(__dirname, 'buildspec.yaml')),
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        },
      })
  
      // allow the project role to assume the `cdk-xaccount-bootstrap-role`
      project.role?.addToPrincipalPolicy(new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: [ 
          'arn:aws:iam::222222222222:role/cdk-hnb659fds-deploy-role-222222222222-us-east-1',
          'arn:aws:iam::222222222222:role/cdk-hnb659fds-cfn-exec-role-222222222222-us-east-1',
          'arn:aws:iam::222222222222:role/cdk-hnb659fds-lookup-role-222222222222-us-east-1',
          'arn:aws:iam::222222222222:role/cdk-hnb659fds-file-publishing-role-222222222222-us-east-1',
          'arn:aws:iam::222222222222:role/cdk-hnb659fds-image-publishing-role-222222222222-us-east-1',
        ]
      }))
      
      new CfnOutput(this, 'BuildRole', { value: project.role!.roleArn })
  
    }
}

const app = new App();

// for development, use account/region from cdk cli
const accountA = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// const accountB = {
//   account: '222222222222',
//   region: 'us-west-2'
// };

new DummyStack(app, 'cross-account-demo-codebuld', { env: accountA });

app.synth();