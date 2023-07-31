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
  AtlasBasic, CfnNetworkContainer, CfnNetworkPeering,
  CfnProject, CfnCluster, CfnDatabaseUser,
} from 'awscdk-resources-mongodbatlas';
import { Construct } from 'constructs';

export interface PeeringProps {
  readonly vpc: ec2.IVpc;
  readonly atlasCidr: string;
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

export interface DemoProps {
  /**
   * profile name for the secret.
   * @default 'default'
   */
  readonly secretProfile?: string;
  readonly clusterName?: string;
  readonly projectName?: string;
  /**
   * The MongoDB Atlas organization ID.
   */
  readonly orgId: string;
  readonly region: string;
  readonly peering?: PeeringProps;
}

export class Demo extends Construct {
  readonly project: CfnProject;
  readonly cluster: CfnCluster;
  readonly dbuser: CfnDatabaseUser;
  constructor(scope: Construct, id: string, props: DemoProps) {
    super(scope, id);

    const orgId = props?.orgId;

    const replicationSpecs = [
      {
        numShards: 1,
        advancedRegionConfigs: [
          {
            analyticsSpecs: {
              ebsVolumeType: 'STANDARD',
              instanceSize: 'M10',
              nodeCount: 1,
            },
            electableSpecs: {
              ebsVolumeType: 'STANDARD',
              instanceSize: 'M10',
              nodeCount: 3,
            },
            priority: 7,
            regionName: props.region,
          },
        ],
      },
    ];

    const atlasBasic = new AtlasBasic(this, `atlas-basic-${id}`, {
      profile: props?.secretProfile ?? 'default',
      clusterProps: {
        replicationSpecs,
        name: props?.clusterName ?? `cluster-${id}`,
      },
      projectProps: {
        orgId,
        name: props?.projectName ?? `project-${id}`,
      },
      ipAccessListProps: {
        accessList: [
          { ipAddress: '0.0.0.0/0', comment: 'My first IP address' },
        ],
      },
    });

    this.project = atlasBasic.mProject;
    this.cluster = atlasBasic.mCluster;
    this.dbuser = atlasBasic.mDBUser;

    if (props.peering) {
      // create network container
      const container = new CfnNetworkContainer(this, `networkcontainer${id}`, {
        projectId: this.project.attrId,
        regionName: props.region,
        profile: props.secretProfile,
        vpcId: props.peering.vpc.vpcId,
        atlasCidrBlock: props.peering.atlasCidr,
        provisioned: true,
      });
      // create the peering
      const peering = new CfnNetworkPeering(this, `networkpeering${id}`, {
        containerId: container.attrId,
        projectId: this.project.attrId,
        vpcId: props.peering.vpc.vpcId,
        profile: props.secretProfile,
        routeTableCidrBlock: props.peering.vpc.vpcCidrBlock,
        accepterRegionName: props.peering.acceptRegionName ?? Aws.REGION,
        awsAccountId: props.peering.accountId ?? Aws.ACCOUNT_ID,
      });
      new CfnOutput(this, 'VpcPeeringConnectionId', { value: peering.attrConnectionId });
      this.cluster.addDependency(container);

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
  }
}