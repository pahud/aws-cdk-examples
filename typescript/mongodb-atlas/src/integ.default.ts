import * as path from 'path';
import {
  App, Stack, StackProps,
  aws_ec2 as ec2,
  aws_secretsmanager as secretsmanager,
  aws_lambda as lambda,
  aws_apigateway as apigw,
  Duration,
  CfnOutput,
  SecretValue,
} from 'aws-cdk-lib';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import {
  MongoAtlasBootstrap,
  MongoAtlasBootstrapProps,
  AtlasBasicResources,
  AtlasServerlessBasic,
  ServerlessInstanceProviderSettingsProviderName,
} from 'awscdk-resources-mongodbatlas';
import { Construct } from 'constructs';

type AccountConfig = {
  readonly orgId: string;
  readonly projectId?: string;
}

const MyAccount: AccountConfig = {
  orgId: '5b71ff2f96e82120d0aaec14',
};

export interface AtlasBasicStackProps extends StackProps {
  readonly orgId: string;
}

const MONGODB_PROFILE_NAME = 'development';

// define the bootstrap stack
// source: https://github.com/mongodb/awscdk-resources-mongodbatlas/blob/main/examples/l3-resources/atlas-bootstrap.ts
export class AtlasBoostrapStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const roleName = 'MongoDB-Atlas-CDK-Excecution';

    const bootstrapProperties: MongoAtlasBootstrapProps = {
      roleName: roleName,
      secretProfile: MONGODB_PROFILE_NAME,
      typesToActivate: [
        'ServerlessInstance',
        'PrivateEndpointAWS',
        ...AtlasBasicResources,
      ],
    };

    new MongoAtlasBootstrap(this, 'cdk-bootstrap', bootstrapProperties);
  }
}

export interface AtlasServerlessBasicStackProps extends StackProps {
  readonly profile: string;
  readonly orgId: string;
  readonly ipAccessList: string;
}

export class AtlasServerlessBasicStack extends Stack {
  readonly dbUserSecret: secretsmanager.ISecret;
  readonly connectionString: string;
  constructor(scope: Construct, id: string, props: AtlasServerlessBasicStackProps) {
    super(scope, id, props);

    const stack = Stack.of(this);
    const projectName = `${stack.stackName}-proj`;

    const dbuserSecret = new secretsmanager.Secret(this, 'DatabaseUserSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'serverless-user' }),
        generateStringKey: 'password',
        excludeCharacters: '%+~`#$&*()|[]{}:;<>?!\'/@"\\=-.,',
      },
    });

    this.dbUserSecret = dbuserSecret;

    const ipAccessList = props.ipAccessList;

    // see https://github.com/mongodb/awscdk-resources-mongodbatlas/blob/main/examples/l3-resources/atlas-serverless-basic.ts#L22
    const basic = new AtlasServerlessBasic(this, 'serverless-basic', {
      serverlessProps: {
        // name: 'demo-instance',
        profile: props.profile,
        // continuousBackupEnabled: props.continuousBackupEnabled ?? true,
        providerSettings: {
          providerName: ServerlessInstanceProviderSettingsProviderName.SERVERLESS,
          regionName: 'US_EAST_1',
        },
        // terminationProtectionEnabled: props.terminationProtection ?? false,
      },
      projectProps: {
        orgId: props.orgId,
        name: projectName,
      },
      dbUserProps: {
        username: 'serverless-user',
        password: SecretValue.secretsManager(dbuserSecret.secretName, {
          jsonField: 'password',
        }).toString(),
      },
      ipAccessListProps: {
        accessList: [
          { ipAddress: ipAccessList, comment: 'My first IP address' },
        ],
      },
      profile: props.profile,
    });

    this.connectionString = basic.mserverless.getAtt('ConnectionStrings.StandardSrv').toString();

    new CfnOutput(this, 'ProjectName', { value: projectName });
    new CfnOutput(this, 'ConnectionString', { value: this.connectionString });
  }
}


const app = new App();
const env = { region: process.env.CDK_DEFAULT_REGION, account: process.env.CDK_DEFAULT_ACCOUNT };

// the bootstrap stack
new AtlasBoostrapStack(app, 'mongo-cdk-bootstrap', { env });

// the serverless stack with mongodb atlas serverless instance
const serverlessStack = new AtlasServerlessBasicStack(app, 'mongo-serverless-basic1', {
  env,
  ipAccessList: '3.227.176.163/32',
  profile: MONGODB_PROFILE_NAME,
  ...MyAccount,
});

// The demo lambda function.
const handler = new lambda.Function(serverlessStack, 'LambdaFunc', {
  code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/playground')),
  runtime: lambda.Runtime.PYTHON_3_10,
  handler: 'index.handler',
  timeout: Duration.seconds(30),
  vpc: ec2.Vpc.fromLookup(serverlessStack, 'Vpc', { isDefault: true }),
  vpcSubnets: {
    subnetType: SubnetType.PRIVATE_WITH_EGRESS,
  },
  environment: {
    CONN_STRING_STANDARD: serverlessStack.connectionString,
    DB_USER_SECRET_ARN: serverlessStack.dbUserSecret.secretArn,
  },
});

// allow the handler to read the db user secret
serverlessStack.dbUserSecret.grantRead(handler);

// // create the API Gateway API with the lambda handler.
new apigw.LambdaRestApi(serverlessStack, 'RestAPI', { handler });

