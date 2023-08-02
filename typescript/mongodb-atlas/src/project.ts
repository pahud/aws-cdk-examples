import { Resource, ResourceProps } from 'aws-cdk-lib';
import { CfnProject } from 'awscdk-resources-mongodbatlas';
import { Construct } from 'constructs';
import { ProjectOptions } from './types';

export interface IProject {
  readonly clusterCount?: number;
  readonly projectId: string;
  readonly projectName: string;
  readonly created?: string;
  readonly projectOwnerId: string;
}

export interface ProjectAttributes {
  readonly projectId: string;
  readonly projectName: string;
  readonly projectOwnerId: string;
}

export interface ProjectProps extends ResourceProps, ProjectOptions {
  readonly profile: string;
}

export class Project extends Resource implements IProject {
  public static fromProjectAttributes(scope: Construct, id: string, attrs: ProjectAttributes): IProject {
    class Import extends Resource {
      public projectId = attrs.projectId;
      public projectName = attrs.projectName;
      public projectOwnerId = attrs.projectOwnerId;
    };
    return new Import(scope, id);
  }
  readonly clusterCount?: number;
  readonly projectId: string;
  readonly created?: string;
  readonly projectOwnerId: string;
  readonly projectName: string;

  constructor(scope: Construct, id: string, props: ProjectProps) {
    super(scope, id);

    this.projectName = props.name ?? `project-${id}`;
    const resource = new CfnProject(this, 'Resource', {
      ...props,
      profile: props.profile,
      orgId: props.orgId,
      name: this.projectName,
    });
    this.clusterCount = resource.attrClusterCount;
    this.projectId = resource.attrId;
    this.created = resource.attrCreated;
    this.projectOwnerId = resource.attrProjectOwnerId;
  }
}