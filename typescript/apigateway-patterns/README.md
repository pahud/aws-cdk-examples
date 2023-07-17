# apigateway-patterns

A curated collection of CDK L3 constructs for Amazon API Gateway.


# ApiGatewayLoadBalancedFargateService

Amazon API Gateway allows you to integrate with VPC link and route traffic to services in VPC through Cloud Map, Application Load Balancers(ALB) or Network Load Balancers(NLB).

This constructs provisions API Gateway HTTP API with Fargate service and route the traffic throught a VPC link. By default, the `vpcLinkIntegration` type is Cloud Map and no ALB or NLB will be created.

<img src=./images/apig-lb-fargate-service.svg>

## Example

```ts
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
```