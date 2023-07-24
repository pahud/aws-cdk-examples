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

const common_exclude = ['cdk.out', 'cdk.context.json', 'yarn-error.log', '!yarn.lock'];
project.npmignore?.exclude(...common_exclude);
project.gitignore.exclude(...common_exclude);

project.synth();


project.synth();