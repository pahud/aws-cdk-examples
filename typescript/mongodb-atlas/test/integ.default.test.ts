import {
  App, Stack,
  aws_ec2 as ec2,
} from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AtlasCluster, ServerlessInstance, ReplicationSpecs, EbsVolumeType, InstanceSize, AwsRegion, ClusterType } from '../src';
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

  // create a ReplicaSet cluster
  const cluster = new AtlasCluster(demoStack, 'Cluster', {
    clusterName: 'my-cluster',
    orgId,
    profile: secretProfile,
    replication,
    accessList: [{ ipAddress: vpc.vpcCidrBlock, comment: 'allow from my VPC only' }],
    peering: { vpc, cidr: '192.168.248.0/21' },
    clusterType: ClusterType.REPLICASET,
  });

  // create a serverless instance
  new ServerlessInstance(demoStack, 'ServerlessInstance', {
    instanceName: 'my-serverless-instance',
    profile: secretProfile,
    project: cluster.project,
    continuousBackup: true,
  });

  [bootstrapStack, demoStack].forEach(stack => {
    const t = Template.fromStack(stack);
    // should match snapshot
    expect(t).toMatchSnapshot();
  });
});