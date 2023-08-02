import {
  App, Stack,
  aws_ec2 as ec2,
} from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AtlasCluster, ReplicationSpecs, EbsVolumeType, InstanceSize, AwsRegion } from '../src';
import { MongoDBAtlasBootstrap } from '../src/bootstrap';

test('default validation', () => {
  const app = new App();
  const bootstrapStack = new Stack(app, 'mongo-cdk-bootstrap');
  const demoStack = new Stack(app, 'mongodb-demo-stack');


  const secretProfile = 'my-mongo-profile';
  // bootstrap by creating the cfn extension execution role and profile secret.
  new MongoDBAtlasBootstrap(bootstrapStack, 'mongoCdkBootstrap', {
    roleName: 'cfn-ext-exec-role-for-mongo',
    secretProfile,
  });

  const replication: ReplicationSpecs[] = [
    {
      numShards: 1,
      advancedRegionConfigs: [
        {
          analyticsSpecs: {
            ebsVolumeType: EbsVolumeType.STANDARD,
            instanceSize: InstanceSize.M10,
            nodeCount: 1,
          },
          electableSpecs: {
            ebsVolumeType: EbsVolumeType.STANDARD,
            instanceSize: InstanceSize.M10,
            nodeCount: 3,
          },
          priority: 7,
          regionName: AwsRegion.US_EAST_1,
        },
      ],
    },
  ];

  const vpc = new ec2.Vpc(demoStack, 'Vpc', { natGateways: 1 });
  const orgId = process.env.MONGODB_ATLAS_ORG_ID || 'mock_id';

  new AtlasCluster(demoStack, 'mongodb-demo', {
    orgId,
    profile: secretProfile,
    replication,
    accessList: [{ ipAddress: '0.0.0.0/0', comment: 'My first IP address' }],
    peering: { vpc, cidr: '192.168.248.0/21' },
  });

  [bootstrapStack, demoStack].forEach(stack => {
    const t = Template.fromStack(stack);
    // should match snapshot
    expect(t).toMatchSnapshot();
  });
});