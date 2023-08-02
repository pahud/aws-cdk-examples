import { Resource, ResourceProps, IResource } from 'aws-cdk-lib';
import { CfnProjectIpAccessList } from 'awscdk-resources-mongodbatlas';
import { Construct } from 'constructs';
import { IProject } from './project';
import { IpAccessListOptions } from './types';

export interface IIpAccessList extends IResource{
}

export interface IpAccessListAttributes {
  readonly userCFNIdentifier: string;
  readonly dabataseUserName: string;
}

export interface IpAccessListProps extends ResourceProps, IpAccessListOptions {
  readonly profile: string;
  readonly project: IProject;
}

export class IpAccessList extends Resource implements IIpAccessList {
  public static fromIpAccessListAttributes(scope: Construct, id: string, attrs: IpAccessListAttributes): IIpAccessList {
    class Import extends Resource {
      public userCFNIdentifier = attrs.userCFNIdentifier;
      public dabataseUserName = attrs.dabataseUserName;
    };
    return new Import(scope, id);
  }

  constructor(scope: Construct, id: string, props: IpAccessListProps) {
    super(scope, id);

    new CfnProjectIpAccessList(this, 'Resource', {
      ...props,
      projectId: props.project.projectId,
      profile: props.profile,
      accessList: props.accessList,
    });
  }
}