import { readFileSync } from 'fs';
import * as path from 'path';
import {
  App, Stack,
  aws_iam as iam,
  aws_ecr as ecr,
  aws_ec2 as ec2,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { InfrastructureConfiguration, ImagePipeline } from './index';
import { ContainerRecipe, ImageBuilderComponent, ImageBuilderComponentPlatform } from './recipe';

export class IntegTesting {
  readonly stack: Stack[];
  constructor() {
    const app = new App();
    const env = { region: process.env.CDK_DEFAULT_REGION, account: process.env.CDK_DEFAULT_ACCOUNT };
    const stack = new Stack(app, 'integ-testing', { env });

    const role = new iam.Role(stack, 'Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    const instanceProfile = new iam.CfnInstanceProfile(stack, 'InstanceProfile', {
      roles: [role.roleName],
    });

    const vpc = this.getVpc(stack);
    const sg = new ec2.SecurityGroup(stack, 'SG', {
      vpc,
      allowAllOutbound: true,
      allowAllIpv6Outbound: true,
    });

    const infrastructureConfiguration = new InfrastructureConfiguration(stack, 'InfraConfig', {
      instanceProfileName: instanceProfile.ref,
      subnet: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }).subnets[0],
      securityGroups: [sg],
    });

    // // AWS CLI v2 component
    // const awscliv2 = ImageBuilderComponent.fromComponentAttributes(stack, 'AwsCliV2Component', {
    //   componentArn: 'arn:aws:imagebuilder:us-east-1:aws:component/aws-cli-version-2-linux/1.0.4/1',
    //   componentName: 'aws-cli-version-2-linux',
    //   componentType: 'Build',
    //   encrypted: 'false',
    // });

    // const amazonLinux2023Ami = ec2.MachineImage.latestAmazonLinux2023().getImage(stack).imageId;

    // const myrecipe = new ImageRecipe(stack, 'Recipe', {
    //   components: [awscliv2],
    //   version: '1.0.0',
    //   parentImage: amazonLinux2023Ami,
    //   recipeName: 'my-recipe',
    // });

    // upload the yaml to S3
    // const yamlDeployment = new s3d.BucketDeployment(stack, 's3-deployment', {
    //   destinationBucket: new s3.Bucket(stack, 'yaml-bucket'),
    //   sources: [s3d.Source.asset(path.join(__dirname, '../components'))],
    // });

    const data = readFileSync(path.join(__dirname, '../components/docker-component.yaml'), { encoding: 'utf-8' });

    const component = new ImageBuilderComponent(stack, 'ContainerComponent', {
      componentName: 'demo-component',
      platform: ImageBuilderComponentPlatform.LINUX,
      version: '1.0.0',
      data,
    });

    const ecrRepo = new ecr.Repository(stack, 'demo-repo');
    const dockerfileTemplateData = readFileSync(path.join(__dirname, '../dockerfile.d/default.yaml'), { encoding: 'utf-8' });
    const containerRecipe = new ContainerRecipe(stack, 'ContainerRecipe', {
      recipeName: 'AmazonLinux2-Container-Recipe',
      parentImage: 'arn:aws:imagebuilder:us-east-1:aws:image/amazon-linux-2023-x86-2023/x.x.x',
      targetRepository: ecrRepo.repositoryName,
      components: [component],
      version: '1.0.0',
      dockerfileTemplateData,
    });

    new ImagePipeline(stack, 'Pipeline', {
      infrastructureConfiguration,
      containerRecipe,
      imageScan: {
        enabled: true,
        ecrConfiguration: {
          repositoryName: ecrRepo.repositoryName,
          tags: ['foo', 'bar', 'latest'],
        },
      },
    });

    this.stack = [stack];
  }
  private getVpc(scope: Construct): ec2.IVpc {
    return scope.node.tryGetContext('use_default_vpc') === '1' ?
      ec2.Vpc.fromLookup(scope, 'Vpc', { isDefault: true }) :
      scope.node.tryGetContext('use_vpc_id') != undefined ?
        ec2.Vpc.fromLookup(scope, 'Vpc', { vpcId: scope.node.tryGetContext('use_vpc_id') }) :
        new ec2.Vpc(scope, 'Vpc', { natGateways: 1 });
  }
};

new IntegTesting();

