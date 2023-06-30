import {
  Resource, Names,
  aws_ec2 as ec2,
  aws_imagebuilder as imagebuilder,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface IInfrastructureConfiguration {
  /**
   * The ARN of the infrastructureConfiguration.
   */
  readonly infrastructureConfigurationArn: string;
  /**
   * The Name of the infrastructureConfiguration.
   */
  readonly infrastructureConfigurationName: string;
}

export interface InfrastructureConfigurationProp {
  readonly infrastructureConfigurationName?: string;
  readonly instanceProfileName: string;
  readonly subnet?: ec2.ISubnet;
  readonly securityGroups?: ec2.ISecurityGroup[];

}

export class InfrastructureConfiguration extends Resource implements IInfrastructureConfiguration {
  readonly infrastructureConfigurationArn: string;
  readonly infrastructureConfigurationName: string;

  constructor(scope: Construct, id: string, props: InfrastructureConfigurationProp) {
    super(scope, id);

    const resource = new imagebuilder.CfnInfrastructureConfiguration(this, 'Resource', {
      name: props.infrastructureConfigurationName ?? Names.uniqueResourceName(this, { maxLength: 128, allowedSpecialCharacters: '-_' }),
      instanceProfileName: props.instanceProfileName,
      subnetId: props.subnet?.subnetId,
      securityGroupIds: props.securityGroups?.map(s => s.securityGroupId ),
    });

    this.infrastructureConfigurationArn = resource.attrArn;
    this.infrastructureConfigurationName = resource.attrName;

  }
}