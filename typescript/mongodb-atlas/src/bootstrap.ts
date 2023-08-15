import {
  CfnOutput, SecretValue,
  aws_iam as iam,
  aws_secretsmanager as secretsmanager,
  aws_cloudformation as cloudformation,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export enum AtlasCfnType {
  CLUSTER = 'Cluster',
  PROJECT = 'Project',
  DATABASE_USER = 'DatabaseUser',
  PROJECT_IP_ACCESS_LIST = 'ProjectIpAccessList',
  NETWORK_CONTAINER = 'NetworkContainer',
  NETWORK_PEERING = 'NetworkPeering',
  SERVERLESS_INSTANCE = 'ServerlessInstance',
}


export class MongoDBAtlasBootstrapProps {
  /**
   * The IAM role name for CloudFormation Extension Execution.
   * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html
   *
   * @default auto generat the name.
   */
  readonly roleName?: string;
  /**
   * The secret profile name for MongoDB Atlas.
   * @default generate a dummy secret.
   * @see https://github.com/mongodb/mongodbatlas-cloudformation-resources/tree/master#2-configure-your-profile
   */
  readonly secretProfile?: string;

  /**
   * CloudFormation extension types to activate.
   * @default CLUSTER, PROJECT, DATABASE_USER, PROJECT_IP_ACCESS_LIST
   */
  readonly typesToActivate?: AtlasCfnType[];
}

/**
* Generate the CFN extension execution role.
* @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html
*/
export class MongoDBAtlasBootstrap extends Construct {
  readonly role: iam.IRole;
  readonly secretProfile: string;
  constructor(scope: Construct, id: string, props?: MongoDBAtlasBootstrapProps) {
    super(scope, id);

    this.secretProfile = props?.secretProfile ?? 'default';
    this.role = new iam.Role(this, 'CfnExecRole', {
      assumedBy: new iam.ServicePrincipal('resources.cloudformation.amazonaws.com'),
      roleName: props?.roleName,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
      ],
    });

    if (props?.secretProfile) {
      new MongoSecretProfile(this, 'MongoSecretProfile', this.secretProfile );
    }
    // activate the CFN extension types
    this.activateCfnExtension(props?.typesToActivate);
    // for (let x of ['Cluster', 'Project', 'DatabaseUser', 'ProjectIpAccessList', 'NetworkContainer', 'NetworkPeering', 'ServerlessInstance'] ) {
    //   new CfnOutput(this, `ActivateCmd${x}`, { value: `aws cloudformation activate-type --type-name MongoDB::Atlas::${x} --publisher-id bb989456c78c398a858fef18f2ca1bfc1fbba082 --type RESOURCE --execution-role-arn ${this.role.roleArn}` });
    // }
  }
  private activateCfnExtension(types?: AtlasCfnType[]) {
    // if types undefined, we only activate basic types.
    const _types = types ?? [
      AtlasCfnType.CLUSTER,
      AtlasCfnType.PROJECT,
      AtlasCfnType.DATABASE_USER,
      AtlasCfnType.PROJECT_IP_ACCESS_LIST,
    ];
    for (let type of _types) {
      new cloudformation.CfnTypeActivation(this, `TypeActivation${type}`, {
        executionRoleArn: this.role.roleArn,
        type: 'RESOURCE',
        typeName: `MongoDB::Atlas::${type}`,
        publisherId: 'bb989456c78c398a858fef18f2ca1bfc1fbba082',
      });
    }
  }
}

export class MongoSecretProfile extends Construct {
  constructor(scope: Construct, id: string, profileName: string) {
    super(scope, id);
    // create a secret
    const secret = new secretsmanager.Secret(this, profileName, {
      secretName: `cfn/atlas/profile/${profileName}`,
      secretStringValue: SecretValue.unsafePlainText('{"PublicKey":"changeMe", "PrivateKey": "changeMe"}'),
    });
    new CfnOutput(this, 'SecretName', { value: secret.secretName });
    new CfnOutput(this, 'UpdateSecretCommand', {
      value: `aws secretsmanager update-secret --secret-id ${secret.secretName}`+ ' --secret-string "{\\"PublicKey\\":\\"${MONGO_ATLAS_PUBLIC_KEY}\\",\\"PrivateKey\\":\\"${MONGO_ATLAS_PRIVATE_KEY}\\"}"',
    });
  }
}