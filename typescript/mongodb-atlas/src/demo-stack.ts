import { Stack, StackProps } from 'aws-cdk-lib';
import { AtlasBasic } from 'awscdk-resources-mongodbatlas';
import { Construct } from 'constructs';

export interface DemoStackProps extends StackProps {
  /**
   * profile name
   * @default 'default'
   */
  readonly profile?: string;
}

export class DemoStack extends Stack {
  constructor(scope: Construct, id: string, props?: DemoStackProps) {
    super(scope, id, props);

    const orgId = this.node.tryGetContext('MONGODB_ATLAS_ORG_ID') || process.env.MONGODB_ATLAS_ORG_ID;
    if (!orgId && process.env.CI != undefined ) {
      throw new Error('orgId not found - define MONGODB_ATLAS_ORG_ID as the context variable or environment variable');
    }

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

    new AtlasBasic(this, 'atlas-basic', {
      profile: props?.profile ?? 'default',
      clusterProps: { replicationSpecs },
      projectProps: { orgId },
      ipAccessListProps: {
        accessList: [
          { ipAddress: '0.0.0.0/0', comment: 'My first IP address' },
        ],
      },
    });
  }
}