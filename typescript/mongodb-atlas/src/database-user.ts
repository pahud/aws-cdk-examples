import {
  Resource, ResourceProps,
  aws_secretsmanager as secretsmanager,
} from 'aws-cdk-lib';
import { CfnDatabaseUser } from 'awscdk-resources-mongodbatlas';
import { Construct } from 'constructs';
import { IProject } from './project';
import { DatabaseUserOptions } from './types';

export interface IDatabaseUser {
  readonly userCFNIdentifier: string;
  readonly dabataseUserName: string;
}

export interface DatabaseUserAttributes {
  readonly userCFNIdentifier: string;
  readonly dabataseUserName: string;
}

export interface DatabaseUserProps extends ResourceProps, DatabaseUserOptions {
  readonly profile: string;
  readonly project: IProject;
}

export class DatabaseUser extends Resource implements IDatabaseUser {
  public static fromDatabaseUserAttributes(scope: Construct, id: string, attrs: DatabaseUserAttributes): IDatabaseUser {
    class Import extends Resource {
      public userCFNIdentifier = attrs.userCFNIdentifier;
      public dabataseUserName = attrs.dabataseUserName;
    };
    return new Import(scope, id);
  }
  readonly userCFNIdentifier: string;
  readonly dabataseUserName: string;
  readonly secret: secretsmanager.Secret;
  private readonly props: DatabaseUserProps;

  constructor(scope: Construct, id: string, props: DatabaseUserProps) {
    super(scope, id);

    this.props = props;
    this.dabataseUserName = props.username ?? 'atlas-user';
    this.secret = this.generateSecret();
    const resource = new CfnDatabaseUser(this, 'Resource', {
      ...props,
      profile: props.profile,
      databaseName: props.databaseName ?? 'admin',
      projectId: props.project.projectId,
      username: this.secret.secretValueFromJson('username').toString(),
      password: this.secret.secretValueFromJson('password').toString(),
      roles: [{ roleName: 'atlasAdmin', databaseName: 'admin' }],
    });
    this.userCFNIdentifier = resource.attrUserCFNIdentifier;
  }
  private generateSecret(): secretsmanager.Secret {
    return new secretsmanager.Secret(this, 'DatabaseUserSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: this.dabataseUserName, password: this.props.password }),
        generateStringKey: this.props.password ? undefined : 'password',
        excludeCharacters: '%+~`#$&*()|[]{}:;<>?!\'/@"\\=-.,',
      },
    });

  }
}