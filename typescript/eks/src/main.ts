import { KubectlV27Layer as KubectlLayer } from '@aws-cdk/lambda-layer-kubectl-v27';
import {
  App, Stack, StackProps,
  aws_eks as eks,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { getVpc } from './util';

export class SingleClusterStack extends Stack {
  readonly cluster: eks.ICluster;
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const vpc = getVpc(this);

    // create a scoped mastersRole
    const mastersRole = this.createMastersRole();

    this.cluster = new eks.Cluster(this, 'Cluster', {
      vpc,
      mastersRole,
      kubectlLayer: new KubectlLayer(this, 'KubectlLayer'),
      version: eks.KubernetesVersion.V1_27,
    });

    // allow mastersRole to access console
    this.enableConsoleAccess(mastersRole);

  }
  private createMastersRole(): iam.Role {
    /**
     * Define the mastersRole for the cluster and scope down the principals
     */
    const mastersRole = new iam.Role(this, 'MastersRole', {
      // assumedBy: new iam.ArnPrincipal('arn:aws:sts::123456789012:assumed-role/AWSReservedSSO_AdministratorAccess_c4188fabc1dd35a2/pahud'),
      assumedBy: new iam.ArnPrincipal(Stack.of(this).formatArn({
        service: 'sts',
        region: '',
        resource: 'assumed-role',
        resourceName: 'AWSReservedSSO_AdministratorAccess_c4188fabc1dd35a2/pahud',
      })),
    });

    mastersRole.assumeRolePolicy?.addStatements(new iam.PolicyStatement({
      actions: ['sts:AssumeRole'],
      principals: [
        // arn:aws:sts::123456789012:assumed-role/AWSReservedSSO_AdministratorAccess_c4188fabc1dd35a2/foo
        new iam.ArnPrincipal(Stack.of(this).formatArn({
          service: 'sts',
          region: '',
          resource: 'assumed-role',
          resourceName: 'AWSReservedSSO_AdministratorAccess_c4188fabc1dd35a2/foo',
        })),
        // arn:aws:sts::123456789012:user/pahud
        new iam.ArnPrincipal(Stack.of(this).formatArn({
          service: 'sts',
          region: '',
          resource: 'user',
          resourceName: 'pahud',
        })),
      ],
    }));
    return mastersRole;
  }
  private enableConsoleAccess(role: iam.Role) {
    role.addToPolicy(new iam.PolicyStatement({
      actions: [
        'eks:Describe*',
        'eks:List*',
        'eks:AccessKubernetesApi',
      ],
      resources: [this.cluster.clusterArn],
    }));
  }
}

const devEnv = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

const app = new App();

new SingleClusterStack(app, 'eks-single-cluster', { env: devEnv });

app.synth();