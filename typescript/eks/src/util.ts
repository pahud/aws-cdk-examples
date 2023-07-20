import {
  aws_ec2 as ec2,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export function getVpc(scope: Construct): ec2.IVpc {
  return scope.node.tryGetContext('use_default_vpc') === '1' ?
      ec2.Vpc.fromLookup(scope, 'Vpc', { isDefault: true }) :
      scope.node.tryGetContext('use_vpc_id') != undefined ?
        ec2.Vpc.fromLookup(scope, 'Vpc', { vpcId: scope.node.tryGetContext('use_vpc_id') }) :
        new ec2.Vpc(scope, 'Vpc', { natGateways: 1 });
}