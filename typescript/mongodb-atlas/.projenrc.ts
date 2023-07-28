import { awscdk, JsonFile } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Pahud Hsieh',
  authorAddress: 'pahudnet@gmail.com',
  cdkVersion: '2.80.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'mongodb-atlas',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/aws-samples/aws-cdk-examples.git',
  deps: [
    '@mongodbatlas-awscdk/atlas-basic',
    '@mongodbatlas-awscdk/cluster',
    '@mongodbatlas-awscdk/database-user',
    '@mongodbatlas-awscdk/project',
    '@mongodbatlas-awscdk/project-ip-access-list',
  ],
  devDeps: [
    'aws-cdk@2.80.0',
  ],
});

// required for vscode eslint extension to locate the tsconfig correctly
project.eslint!.config.parserOptions.tsconfigRootDir = 'typescript/mongodb-atlas';
/**
 * reset tsconfigRootDir to null as a workaround for eslint CLI
 * see https://github.com/typescript-eslint/typescript-eslint/issues/251#issuecomment-493187240
 */
const tasksJson = project.tryFindObjectFile('.projen/tasks.json')!;
tasksJson.addOverride('tasks.eslint.steps.0.exec', 'eslint --ext .ts,.tsx --fix --no-error-on-unmatched-pattern src test build-tools projenrc .projenrc.ts --parser-options={tsconfigRootDir:null}');

new JsonFile(project, 'cdk.json', {
  obj: {
    app: 'npx ts-node --prefer-ts-exts src/integ.default.ts',
  },
});

const common_exclude = ['cdk.out', 'cdk.context.json', 'yarn-error.log', '.github', '.mergify.yml', '!yarn.lock'];
project.npmignore?.exclude(...common_exclude);
project.gitignore.exclude(...common_exclude);

project.synth();