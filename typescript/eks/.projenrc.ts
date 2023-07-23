import { awscdk } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.80.0',
  defaultReleaseBranch: 'main',
  name: 'eks',
  projenrcTs: true,
  deps: [
    '@aws-cdk/lambda-layer-kubectl-v27',
  ],
});
project.synth();