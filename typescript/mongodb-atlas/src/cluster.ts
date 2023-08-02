import { Resource, ResourceProps } from 'aws-cdk-lib';
import { CfnCluster, ConnectionStrings } from 'awscdk-resources-mongodbatlas';
import { Construct } from 'constructs';
import { IProject } from './project';
import { ClusterOptions, ClusterType } from './types';

export interface ICluster {
  readonly mongoDBVersion?: string;
  readonly clusterId: string;
  readonly createdDate?: string;
  readonly stateName?: string;
  readonly clusterName: string;
}

export interface ClusterAttributes {
  readonly clusterId: string;
  readonly clusterName: string;
}

export interface ClusterProps extends ResourceProps, ClusterOptions {
  readonly profile: string;
  readonly project: IProject;
}

export class Cluster extends Resource implements ICluster {
  public static fromClusterAttributes(scope: Construct, id: string, attrs: ClusterAttributes): ICluster {
    class Import extends Resource {
      public clusterId = attrs.clusterId;
      public clusterName = attrs.clusterName;
    };
    return new Import(scope, id);
  }
  readonly mongoDBVersion?: string;
  readonly clusterId: string;
  readonly createdDate?: string;
  readonly stateName?: string;
  readonly clusterName: string;
  readonly connectionStrings: ConnectionStrings;

  constructor(scope: Construct, id: string, props: ClusterProps) {
    super(scope, id);

    this.clusterName = props.name ?? `atlas-cluster-${id}`;
    const resource = new CfnCluster(this, 'Resource', {
      ...props,
      replicationSpecs: props.replicationSpecs,
      projectId: props.project.projectId,
      profile: props.profile,
      name: this.clusterName,
      clusterType: props.clusterType ?? ClusterType.REPLICASET,
    });
    this.mongoDBVersion = resource.attrMongoDBVersion;
    this.clusterId = resource.attrId;
    this.createdDate = resource.attrCreatedDate;
    this.stateName = resource.attrStateName;
    this.connectionStrings = resource.connectionStrings;
  }
}