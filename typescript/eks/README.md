# Amazon EKS with CDK examples

An assortment of CDK samples designed to enhance the developer experience when utilizing CDK for Amazon EKS.

# Single Cluster

When we create the basic Amazon EKS cluster with CDK, make sure to scope down the `mastersRole` with scoped trust policies and enable the Amazon EKS console access by granting required IAM policies. 

Make sure always install and import the KubectlLayer of the same version with the cluster.

Check ths `SingleClusterStack` from [src/main.ts](./src/main.ts) for more details.

```ts
import { KubectlV27Layer } from '@aws-cdk/lambda-layer-kubectl-v27';
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
      kubectlLayer: new KubectlV27Layer(this, 'KubectlLayer'),
      version: eks.KubernetesVersion.V1_27,
    });

    // allow mastersRole to access console
    this.enableConsoleAccess(mastersRole);
  };
};
```

Read the [document](https://github.com/aws/aws-cdk/blob/main/packages/aws-cdk-lib/aws-eks/README.md) for more details about `aws-eks` CDK construct library.

# Import cluster from another stack

It is a common use case that the cluster is created in one stake while apps and service in another with imported cluster.

(TBD)

Read [#25835](https://github.com/aws/aws-cdk/issues/25835) or [#25674](https://github.com/aws/aws-cdk/issues/25674) for more discussion.
