import { CfnOutput, Resource, ResourceProps } from 'aws-cdk-lib';
import { CfnServerlessInstance, ServerlessInstanceProviderSettingsProviderName } from 'awscdk-resources-mongodbatlas';
import { Construct } from 'constructs';
import { IProject, Project } from './project';
import { AwsRegion } from './types';

export interface IServerlessInstance {
  readonly mongoDBVersion?: string;
  readonly instanceId: string;
  readonly createDate?: string;
  readonly stateName?: string;
  readonly instanceName: string;
  readonly totalCount?: number;
}

export interface ServerlessInstanceAttributes {
  readonly instanceId: string;
  readonly instanceName: string;
}

/**
 * Properties to create a serverless instance
 * @see https://www.mongodb.com/docs/atlas/reference/api-resources-spec/v2/#tag/Serverless-Instances/operation/createServerlessInstance
 */
export interface ServerlessInstanceProps extends ResourceProps {
  readonly profile: string;
  readonly project?: IProject;
  /**
   * The Organization ID for this cluster.
   */
  readonly orgId?: string;
  /**
   * Name of the instance.
   */
  readonly instanceName?: string;
  /**
   * Flag that indicates whether the serverless instance uses Serverless Continuous Backup.
   * If this parameter is false, the serverless instance uses Basic Backup.
   * @default true
   */
  readonly continuousBackup?: boolean;
  /**
   * Flag that indicates whether termination protection is enabled on the serverless instance.
   * If set to true, MongoDB Cloud won't delete the serverless instance. If set to false, MongoDB Cloud will delete the serverless instance.
   *
   * @default false
   */
  readonly terminationProtection?: boolean;
  /**
   * Region for the network container.
   *
   * @default US_EAST_1
   */
  readonly awsRegion?: AwsRegion;
}

export class ServerlessInstance extends Resource implements IServerlessInstance {
  public static fromServerlessInstanceAttributes(scope: Construct, id: string, attrs: ServerlessInstanceAttributes): IServerlessInstance {
    class Import extends Resource {
      public instanceId = attrs.instanceId;
      public instanceName = attrs.instanceName;
    };
    return new Import(scope, id);
  }
  readonly orgId?: string;
  readonly profile: string;
  readonly project: IProject;
  readonly mongoDBVersion?: string;
  readonly instanceId: string;
  readonly createDate?: string;
  readonly stateName?: string;
  readonly instanceName: string;
  readonly totalCount?: number;
  readonly connectionString: string;

  constructor(scope: Construct, id: string, props: ServerlessInstanceProps) {
    super(scope, id);

    if (!props.orgId && !props.project) {
      throw new Error('orgId is required if project is undefined');
    }

    this.orgId = props.orgId;
    this.profile = props.profile;
    this.project = props.project ?? this.createProject(id, this.orgId!);
    this.instanceName = props.instanceName ?? `atlas-serverlessInstance-${id}`;
    const resource = new CfnServerlessInstance(this, 'Resource', {
      name: this.instanceName,
      projectId: this.project.projectId,
      profile: props.profile,
      providerSettings: {
        providerName: ServerlessInstanceProviderSettingsProviderName.SERVERLESS,
        regionName: props.awsRegion ?? 'US_EAST_1',
      },
      continuousBackupEnabled: props.continuousBackup ?? true,
      terminationProtectionEnabled: props.terminationProtection ?? false,
    });
    this.mongoDBVersion = resource.attrMongoDBVersion;
    this.instanceId = resource.attrId;
    this.createDate = resource.attrCreateDate;
    this.stateName = resource.attrStateName;
    this.totalCount = resource.attrTotalCount;
    this.connectionString = resource.getAtt('ConnectionStrings.StandardSrv').toString();

    new CfnOutput(this, 'ConnectionString', { value: this.connectionString });
  }
  private createProject(id: string, orgId: string): Project {
    return new Project(this, `project${id}`, {
      orgId,
      profile: this.profile,
    });
  };
}