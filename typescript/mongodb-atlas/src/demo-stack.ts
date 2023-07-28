import { Stack, StackProps } from 'aws-cdk-lib';
import { AtlasBasic } from 'awscdk-resources-mongodbatlas';
import { Construct } from 'constructs';

export interface DemoStackProps extends StackProps {
  /**
   * profile name for the secret.
   * @default 'default'
   */
  readonly secretProfile?: string;
  readonly clusterName?: string;
  /**
   * The MongoDB Atlas organization ID.
   */
  readonly orgId: string;
}

export class DemoStack extends Stack {
  constructor(scope: Construct, id: string, props: DemoStackProps) {
    super(scope, id, props);

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
            regionName: 'US_EAST_1',
          },
        ],
      },
    ];

    new AtlasBasic(this, `atlas-basic-${id}`, {
      profile: props?.secretProfile ?? 'default',
      clusterProps: {
        replicationSpecs,
        name: props?.clusterName ?? `cluster-${id}`,
      },
      projectProps: { orgId },
      ipAccessListProps: {
        accessList: [
          { ipAddress: '0.0.0.0/0', comment: 'My first IP address' },
        ],
      },
    });
  }
}