import { Stack, StackProps,
  aws_elasticloadbalancingv2 as elbv2,
  aws_ec2 as ec2,
  custom_resources as cr,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class RuleTagger extends Construct {
  constructor(scope: Construct, id: string, props: {
    rule: elbv2.ApplicationListenerRule,
    tags: { [key: string]: string },
  }) {
    super(scope, id);

    const tagger = new cr.AwsCustomResource(this, 'Tagger', {
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
      onUpdate: {
        service: 'ELBv2',
        action: 'addTags',
        parameters: {
          ResourceArns: [props.rule.listenerRuleArn],
          // covert props.tags to [{ 'Key': 'Key1', 'Value': 'Value1}, { 'Key': 'Key2', 'Value': 'Value2' }] and pass to Tags
          Tags: Object.entries(props.tags).map(([Key, Value]) => ({ Key, Value })),
        },
        physicalResourceId: cr.PhysicalResourceId.of(props.rule.listenerRuleArn),
      },
    });
    tagger.node.addDependency(props.rule);
  }
}


export class AlbListenerruleTaggerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // import default vpc
    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', { isDefault: true });

    // create an ALB with a listener and a default target group
    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: true,
    });

    const listener = alb.addListener('Listener', {
      port: 80,
      open: true,
      defaultAction: elbv2.ListenerAction.fixedResponse(200),
    });

    // create a listener rule
    const rule = new elbv2.ApplicationListenerRule(this, 'ListenerRule', {
      listener,
      priority: 1,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/hello'])],
      action: elbv2.ListenerAction.fixedResponse(200),
    });

    // create the rule tagger
    new RuleTagger(this, 'RuleTagger', {
      rule,
      tags: {
        foo: 'bar',
      },
    });
  }
}
