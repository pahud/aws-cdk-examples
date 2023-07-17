import {
  App, Stack,
  aws_ecs as ecs,
  aws_ec2 as ec2,
} from 'aws-cdk-lib';
import { ApiGatewayLoadBalancedFargateService, VpcLinkIntegration } from './agw-balanced-fargate-service';

export class IntegTesting {
  readonly stack: Stack[];
  constructor() {
    const app = new App();
    const env = { region: process.env.CDK_DEFAULT_REGION, account: process.env.CDK_DEFAULT_ACCOUNT };
    const stack = new Stack(app, 'integ-testing', { env });

    const vpc = new ec2.Vpc(stack, 'Vpc', { natGateways: 1 });
    const cluster = new ecs.Cluster(stack, 'Cluster', { vpc });
    const taskDefinition = new ecs.FargateTaskDefinition(stack, 'Task', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    taskDefinition.addContainer('nyancat', {
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/pahudnet/nyancat-docker-image:latest'),
      portMappings: [{ containerPort: 80, name: 'default' }],
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost/ || exit 1'],
      },
    });

    new ApiGatewayLoadBalancedFargateService(stack, 'DemoService', {
      vpc,
      cluster,
      taskDefinition,
      vpcLinkIntegration: VpcLinkIntegration.CLOUDMAP,
    });
    this.stack = [stack];
  }
};

new IntegTesting();