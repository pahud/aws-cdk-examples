# replace this
# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### ImagePipeline <a name="ImagePipeline" id="aws-imagebuilder.ImagePipeline"></a>

- *Implements:* <a href="#aws-imagebuilder.IImagePipeline">IImagePipeline</a>

#### Initializers <a name="Initializers" id="aws-imagebuilder.ImagePipeline.Initializer"></a>

```typescript
import { ImagePipeline } from 'aws-imagebuilder'

new ImagePipeline(scope: Construct, id: string, props: ImagePipelineProp)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ImagePipeline.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImagePipeline.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImagePipeline.Initializer.parameter.props">props</a></code> | <code><a href="#aws-imagebuilder.ImagePipelineProp">ImagePipelineProp</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-imagebuilder.ImagePipeline.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-imagebuilder.ImagePipeline.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-imagebuilder.ImagePipeline.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-imagebuilder.ImagePipelineProp">ImagePipelineProp</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-imagebuilder.ImagePipeline.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-imagebuilder.ImagePipeline.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |

---

##### `toString` <a name="toString" id="aws-imagebuilder.ImagePipeline.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="aws-imagebuilder.ImagePipeline.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="aws-imagebuilder.ImagePipeline.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-imagebuilder.ImagePipeline.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-imagebuilder.ImagePipeline.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#aws-imagebuilder.ImagePipeline.isResource">isResource</a></code> | Check whether the given construct is a Resource. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-imagebuilder.ImagePipeline.isConstruct"></a>

```typescript
import { ImagePipeline } from 'aws-imagebuilder'

ImagePipeline.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-imagebuilder.ImagePipeline.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="aws-imagebuilder.ImagePipeline.isOwnedResource"></a>

```typescript
import { ImagePipeline } from 'aws-imagebuilder'

ImagePipeline.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-imagebuilder.ImagePipeline.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="aws-imagebuilder.ImagePipeline.isResource"></a>

```typescript
import { ImagePipeline } from 'aws-imagebuilder'

ImagePipeline.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-imagebuilder.ImagePipeline.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ImagePipeline.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-imagebuilder.ImagePipeline.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#aws-imagebuilder.ImagePipeline.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#aws-imagebuilder.ImagePipeline.property.imagePipelineArn">imagePipelineArn</a></code> | <code>string</code> | The ARN of the pipeline. |
| <code><a href="#aws-imagebuilder.ImagePipeline.property.imagePipelineName">imagePipelineName</a></code> | <code>string</code> | The Name of the pipeline. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-imagebuilder.ImagePipeline.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="aws-imagebuilder.ImagePipeline.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="aws-imagebuilder.ImagePipeline.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `imagePipelineArn`<sup>Required</sup> <a name="imagePipelineArn" id="aws-imagebuilder.ImagePipeline.property.imagePipelineArn"></a>

```typescript
public readonly imagePipelineArn: string;
```

- *Type:* string

The ARN of the pipeline.

---

##### `imagePipelineName`<sup>Required</sup> <a name="imagePipelineName" id="aws-imagebuilder.ImagePipeline.property.imagePipelineName"></a>

```typescript
public readonly imagePipelineName: string;
```

- *Type:* string

The Name of the pipeline.

---


### InfrastructureConfiguration <a name="InfrastructureConfiguration" id="aws-imagebuilder.InfrastructureConfiguration"></a>

- *Implements:* <a href="#aws-imagebuilder.IInfrastructureConfiguration">IInfrastructureConfiguration</a>

#### Initializers <a name="Initializers" id="aws-imagebuilder.InfrastructureConfiguration.Initializer"></a>

```typescript
import { InfrastructureConfiguration } from 'aws-imagebuilder'

new InfrastructureConfiguration(scope: Construct, id: string, props: InfrastructureConfigurationProp)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.Initializer.parameter.props">props</a></code> | <code><a href="#aws-imagebuilder.InfrastructureConfigurationProp">InfrastructureConfigurationProp</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-imagebuilder.InfrastructureConfiguration.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-imagebuilder.InfrastructureConfiguration.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-imagebuilder.InfrastructureConfiguration.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-imagebuilder.InfrastructureConfigurationProp">InfrastructureConfigurationProp</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |

---

##### `toString` <a name="toString" id="aws-imagebuilder.InfrastructureConfiguration.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="aws-imagebuilder.InfrastructureConfiguration.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="aws-imagebuilder.InfrastructureConfiguration.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.isResource">isResource</a></code> | Check whether the given construct is a Resource. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-imagebuilder.InfrastructureConfiguration.isConstruct"></a>

```typescript
import { InfrastructureConfiguration } from 'aws-imagebuilder'

InfrastructureConfiguration.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-imagebuilder.InfrastructureConfiguration.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="aws-imagebuilder.InfrastructureConfiguration.isOwnedResource"></a>

```typescript
import { InfrastructureConfiguration } from 'aws-imagebuilder'

InfrastructureConfiguration.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-imagebuilder.InfrastructureConfiguration.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="aws-imagebuilder.InfrastructureConfiguration.isResource"></a>

```typescript
import { InfrastructureConfiguration } from 'aws-imagebuilder'

InfrastructureConfiguration.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-imagebuilder.InfrastructureConfiguration.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.property.infrastructureConfigurationArn">infrastructureConfigurationArn</a></code> | <code>string</code> | The ARN of the infrastructureConfiguration. |
| <code><a href="#aws-imagebuilder.InfrastructureConfiguration.property.infrastructureConfigurationName">infrastructureConfigurationName</a></code> | <code>string</code> | The Name of the infrastructureConfiguration. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-imagebuilder.InfrastructureConfiguration.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="aws-imagebuilder.InfrastructureConfiguration.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="aws-imagebuilder.InfrastructureConfiguration.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `infrastructureConfigurationArn`<sup>Required</sup> <a name="infrastructureConfigurationArn" id="aws-imagebuilder.InfrastructureConfiguration.property.infrastructureConfigurationArn"></a>

```typescript
public readonly infrastructureConfigurationArn: string;
```

- *Type:* string

The ARN of the infrastructureConfiguration.

---

##### `infrastructureConfigurationName`<sup>Required</sup> <a name="infrastructureConfigurationName" id="aws-imagebuilder.InfrastructureConfiguration.property.infrastructureConfigurationName"></a>

```typescript
public readonly infrastructureConfigurationName: string;
```

- *Type:* string

The Name of the infrastructureConfiguration.

---


## Structs <a name="Structs" id="Structs"></a>

### ImagePipelineProp <a name="ImagePipelineProp" id="aws-imagebuilder.ImagePipelineProp"></a>

#### Initializer <a name="Initializer" id="aws-imagebuilder.ImagePipelineProp.Initializer"></a>

```typescript
import { ImagePipelineProp } from 'aws-imagebuilder'

const imagePipelineProp: ImagePipelineProp = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ImagePipelineProp.property.infrastructureConfiguration">infrastructureConfiguration</a></code> | <code><a href="#aws-imagebuilder.IInfrastructureConfiguration">IInfrastructureConfiguration</a></code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImagePipelineProp.property.pipelineName">pipelineName</a></code> | <code>string</code> | Name of the pipeline. |

---

##### `infrastructureConfiguration`<sup>Required</sup> <a name="infrastructureConfiguration" id="aws-imagebuilder.ImagePipelineProp.property.infrastructureConfiguration"></a>

```typescript
public readonly infrastructureConfiguration: IInfrastructureConfiguration;
```

- *Type:* <a href="#aws-imagebuilder.IInfrastructureConfiguration">IInfrastructureConfiguration</a>

---

##### `pipelineName`<sup>Optional</sup> <a name="pipelineName" id="aws-imagebuilder.ImagePipelineProp.property.pipelineName"></a>

```typescript
public readonly pipelineName: string;
```

- *Type:* string
- *Default:* auto-generated

Name of the pipeline.

---

### InfrastructureConfigurationProp <a name="InfrastructureConfigurationProp" id="aws-imagebuilder.InfrastructureConfigurationProp"></a>

#### Initializer <a name="Initializer" id="aws-imagebuilder.InfrastructureConfigurationProp.Initializer"></a>

```typescript
import { InfrastructureConfigurationProp } from 'aws-imagebuilder'

const infrastructureConfigurationProp: InfrastructureConfigurationProp = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.InfrastructureConfigurationProp.property.instanceProfileName">instanceProfileName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.InfrastructureConfigurationProp.property.infrastructureConfigurationName">infrastructureConfigurationName</a></code> | <code>string</code> | *No description.* |

---

##### `instanceProfileName`<sup>Required</sup> <a name="instanceProfileName" id="aws-imagebuilder.InfrastructureConfigurationProp.property.instanceProfileName"></a>

```typescript
public readonly instanceProfileName: string;
```

- *Type:* string

---

##### `infrastructureConfigurationName`<sup>Optional</sup> <a name="infrastructureConfigurationName" id="aws-imagebuilder.InfrastructureConfigurationProp.property.infrastructureConfigurationName"></a>

```typescript
public readonly infrastructureConfigurationName: string;
```

- *Type:* string

---


## Protocols <a name="Protocols" id="Protocols"></a>

### IImagePipeline <a name="IImagePipeline" id="aws-imagebuilder.IImagePipeline"></a>

- *Implemented By:* <a href="#aws-imagebuilder.ImagePipeline">ImagePipeline</a>, <a href="#aws-imagebuilder.IImagePipeline">IImagePipeline</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.IImagePipeline.property.imagePipelineArn">imagePipelineArn</a></code> | <code>string</code> | The ARN of the pipeline. |
| <code><a href="#aws-imagebuilder.IImagePipeline.property.imagePipelineName">imagePipelineName</a></code> | <code>string</code> | The Name of the pipeline. |

---

##### `imagePipelineArn`<sup>Required</sup> <a name="imagePipelineArn" id="aws-imagebuilder.IImagePipeline.property.imagePipelineArn"></a>

```typescript
public readonly imagePipelineArn: string;
```

- *Type:* string

The ARN of the pipeline.

---

##### `imagePipelineName`<sup>Required</sup> <a name="imagePipelineName" id="aws-imagebuilder.IImagePipeline.property.imagePipelineName"></a>

```typescript
public readonly imagePipelineName: string;
```

- *Type:* string

The Name of the pipeline.

---

### IInfrastructureConfiguration <a name="IInfrastructureConfiguration" id="aws-imagebuilder.IInfrastructureConfiguration"></a>

- *Implemented By:* <a href="#aws-imagebuilder.InfrastructureConfiguration">InfrastructureConfiguration</a>, <a href="#aws-imagebuilder.IInfrastructureConfiguration">IInfrastructureConfiguration</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.IInfrastructureConfiguration.property.infrastructureConfigurationArn">infrastructureConfigurationArn</a></code> | <code>string</code> | The ARN of the infrastructureConfiguration. |
| <code><a href="#aws-imagebuilder.IInfrastructureConfiguration.property.infrastructureConfigurationName">infrastructureConfigurationName</a></code> | <code>string</code> | The Name of the infrastructureConfiguration. |

---

##### `infrastructureConfigurationArn`<sup>Required</sup> <a name="infrastructureConfigurationArn" id="aws-imagebuilder.IInfrastructureConfiguration.property.infrastructureConfigurationArn"></a>

```typescript
public readonly infrastructureConfigurationArn: string;
```

- *Type:* string

The ARN of the infrastructureConfiguration.

---

##### `infrastructureConfigurationName`<sup>Required</sup> <a name="infrastructureConfigurationName" id="aws-imagebuilder.IInfrastructureConfiguration.property.infrastructureConfigurationName"></a>

```typescript
public readonly infrastructureConfigurationName: string;
```

- *Type:* string

The Name of the infrastructureConfiguration.

---

