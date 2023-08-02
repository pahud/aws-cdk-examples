import * as path from 'path';
import {
  Aws, Stack,
  CfnOutput,
  aws_ec2 as ec2,
  custom_resources as cr,
  aws_lambda as lambda,
  aws_iam as iam,
  CustomResource,
} from 'aws-cdk-lib';
import {
  ConnectionStrings, CfnNetworkContainer, CfnNetworkPeering,
} from 'awscdk-resources-mongodbatlas';
import { Construct } from 'constructs';
import {
  Cluster, DatabaseUser, IDatabaseUser, IpAccessList, AccessList,
  IProject, Project, ReplicationSpecs, AwsRegion,
} from './';

export interface PeeringProps {
  readonly vpc: ec2.IVpc;
  readonly cidr: string;
  /**
   * The AWS region name to accept the peering.
   * @default - current region name.
   */
  readonly acceptRegionName?: string;
  /**
   * The AWS account ID.
   * @default - current account ID.
   */
  readonly accountId?: string;
}

export interface AtlasClusterProps {
  readonly orgId: string;
  readonly profile: string;
  readonly project?: IProject;
  readonly user?: IDatabaseUser;
  readonly accessList: AccessList[];
  readonly replication: ReplicationSpecs[];
  readonly peering?: PeeringProps;
  /**
   * region for the network container
   * @default US_EAST_1
   */
  readonly region?: AwsRegion;
}

export class AtlasCluster extends Construct {
  readonly props: AtlasClusterProps;
  readonly orgId: string;
  readonly profile: string;
  readonly project: IProject;
  readonly cluster: Cluster;
  readonly ipAccessList: IpAccessList;
  readonly connectionStrings: ConnectionStrings;
  readonly databaseUser: DatabaseUser;

  constructor(scope: Construct, id: string, props: AtlasClusterProps ) {
    super(scope, id);

    this.props = props;
    this.orgId = props.orgId;
    this.profile = props.profile;
    this.project = props.project ?? this.createProject(id);
    this.cluster = this.createCluster(id);
    this.connectionStrings = this.cluster.connectionStrings;
    this.databaseUser = this.createDatabaseUser(id);
    this.ipAccessList = this.createIpAccessList(id);

    // determine the region

    if (props.peering) {
      // create network container
      const container = new CfnNetworkContainer(this, `networkcontainer${id}`, {
        projectId: this.project.projectId,
        regionName: props.region ?? 'US_EAST_1',
        profile: props.profile,
        vpcId: props.peering.vpc.vpcId,
        atlasCidrBlock: props.peering.cidr,
        provisioned: true,
      });
      // create the peering
      const peering = new CfnNetworkPeering(this, `networkpeering${id}`, {
        containerId: container.attrId,
        projectId: this.project.projectId,
        vpcId: props.peering.vpc.vpcId,
        profile: props.profile,
        routeTableCidrBlock: props.peering.vpc.vpcCidrBlock,
        accepterRegionName: props.peering.acceptRegionName ?? Aws.REGION,
        awsAccountId: props.peering.accountId ?? Aws.ACCOUNT_ID,
      });
      new CfnOutput(this, 'VpcPeeringConnectionId', { value: peering.attrConnectionId });
      this.cluster.node.addDependency(container);

      // create the custom resource to accept the peering request
      const provider = new cr.Provider(this, 'VpcPeeringProvider', {
        onEventHandler: new lambda.Function(this, 'VpcPeeringHandler', {
          runtime: lambda.Runtime.PYTHON_3_10,
          code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
          handler: 'vpc-peering-handler.on_event',
        }),
      });
      provider.onEventHandler.addToRolePolicy(new iam.PolicyStatement({
        actions: [
          'ec2:AcceptVpcPeeringConnection',
          'ec2:DescribeVpcPeeringConnections',
          'ec2:DeleteVpcPeeringConnection',
        ],
        resources: [
          Stack.of(this).formatArn({
            service: 'ec2',
            resource: 'vpc-peering-connection',
            account: props.peering.accountId ?? Aws.ACCOUNT_ID,
            resourceName: peering.attrConnectionId,
          }),
          Stack.of(this).formatArn({
            service: 'ec2',
            resource: 'vpc',
            account: props.peering.accountId ?? Aws.ACCOUNT_ID,
            resourceName: props.peering.vpc.vpcId,
          }),
        ],
      }));
      provider.onEventHandler.addToRolePolicy(new iam.PolicyStatement({
        actions: [
          'ec2:AcceptVpcPeeringConnection',
          'ec2:DescribeVpcPeeringConnections',
          'ec2:DeleteVpcPeeringConnection',
        ],
        resources: [
          Stack.of(this).formatArn({
            service: 'ec2',
            resource: 'vpc-peering-connection',
            account: props.peering.accountId ?? Aws.ACCOUNT_ID,
            resourceName: peering.attrConnectionId,
          }),
          Stack.of(this).formatArn({
            service: 'ec2',
            resource: 'vpc',
            account: props.peering.accountId ?? Aws.ACCOUNT_ID,
            resourceName: props.peering.vpc.vpcId,
          }),
        ],
      }));
      const peeringHandlerResource = new CustomResource(this, 'CustomResourceVpcPeeringHandler', {
        serviceToken: provider.serviceToken,
        resourceType: 'Custom::VpcPeeringHandler',
        properties: {
          ConnectionId: peering.attrConnectionId,
        },
      });
      peeringHandlerResource.node.addDependency(peering);
    }

    new CfnOutput(this, 'connectionStrings', { value: this.cluster.connectionStrings.standardSrv! });

  }
  private createProject(id: string): Project {
    return new Project(this, `project${id}`, {
      orgId: this.orgId,
      profile: this.profile,
    });
  };
  private createCluster(id: string): Cluster {
    return new Cluster(this, `cluster${id}`, {
      profile: this.profile,
      project: this.project,
      replicationSpecs: this.props.replication,
    });
  }
  private createDatabaseUser(id: string): DatabaseUser {
    return new DatabaseUser(this, `dbuser${id}`, {
      profile: this.profile,
      project: this.project,
    });
  }
  private createIpAccessList(id: string): IpAccessList {
    return new IpAccessList(this, `ipaccesslist${id}`, {
      profile: this.profile,
      project: this.project,
      accessList: this.props.accessList,
    });
  }

}
