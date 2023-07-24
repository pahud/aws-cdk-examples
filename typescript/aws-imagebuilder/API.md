# replace this
# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### ContainerRecipe <a name="ContainerRecipe" id="aws-imagebuilder.ContainerRecipe"></a>

- *Implements:* <a href="#aws-imagebuilder.IRecipe">IRecipe</a>

#### Initializers <a name="Initializers" id="aws-imagebuilder.ContainerRecipe.Initializer"></a>

```typescript
import { ContainerRecipe } from 'aws-imagebuilder'

new ContainerRecipe(scope: Construct, id: string, props: ContainerRecipeProp)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ContainerRecipe.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ContainerRecipe.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ContainerRecipe.Initializer.parameter.props">props</a></code> | <code><a href="#aws-imagebuilder.ContainerRecipeProp">ContainerRecipeProp</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-imagebuilder.ContainerRecipe.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-imagebuilder.ContainerRecipe.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-imagebuilder.ContainerRecipe.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-imagebuilder.ContainerRecipeProp">ContainerRecipeProp</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-imagebuilder.ContainerRecipe.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-imagebuilder.ContainerRecipe.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |

---

##### `toString` <a name="toString" id="aws-imagebuilder.ContainerRecipe.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="aws-imagebuilder.ContainerRecipe.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="aws-imagebuilder.ContainerRecipe.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-imagebuilder.ContainerRecipe.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-imagebuilder.ContainerRecipe.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#aws-imagebuilder.ContainerRecipe.isResource">isResource</a></code> | Check whether the given construct is a Resource. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-imagebuilder.ContainerRecipe.isConstruct"></a>

```typescript
import { ContainerRecipe } from 'aws-imagebuilder'

ContainerRecipe.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-imagebuilder.ContainerRecipe.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="aws-imagebuilder.ContainerRecipe.isOwnedResource"></a>

```typescript
import { ContainerRecipe } from 'aws-imagebuilder'

ContainerRecipe.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-imagebuilder.ContainerRecipe.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="aws-imagebuilder.ContainerRecipe.isResource"></a>

```typescript
import { ContainerRecipe } from 'aws-imagebuilder'

ContainerRecipe.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-imagebuilder.ContainerRecipe.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ContainerRecipe.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-imagebuilder.ContainerRecipe.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#aws-imagebuilder.ContainerRecipe.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#aws-imagebuilder.ContainerRecipe.property.recipeArn">recipeArn</a></code> | <code>string</code> | The ARN of the Recipe. |
| <code><a href="#aws-imagebuilder.ContainerRecipe.property.recipeName">recipeName</a></code> | <code>string</code> | The Name of the Recipe. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-imagebuilder.ContainerRecipe.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="aws-imagebuilder.ContainerRecipe.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="aws-imagebuilder.ContainerRecipe.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `recipeArn`<sup>Required</sup> <a name="recipeArn" id="aws-imagebuilder.ContainerRecipe.property.recipeArn"></a>

```typescript
public readonly recipeArn: string;
```

- *Type:* string

The ARN of the Recipe.

---

##### `recipeName`<sup>Required</sup> <a name="recipeName" id="aws-imagebuilder.ContainerRecipe.property.recipeName"></a>

```typescript
public readonly recipeName: string;
```

- *Type:* string

The Name of the Recipe.

---


### ImageBuilderComponent <a name="ImageBuilderComponent" id="aws-imagebuilder.ImageBuilderComponent"></a>

- *Implements:* <a href="#aws-imagebuilder.IImageBuilderComponent">IImageBuilderComponent</a>

#### Initializers <a name="Initializers" id="aws-imagebuilder.ImageBuilderComponent.Initializer"></a>

```typescript
import { ImageBuilderComponent } from 'aws-imagebuilder'

new ImageBuilderComponent(scope: Construct, id: string, props: ImageBuilderComponentProp)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.Initializer.parameter.props">props</a></code> | <code><a href="#aws-imagebuilder.ImageBuilderComponentProp">ImageBuilderComponentProp</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-imagebuilder.ImageBuilderComponent.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-imagebuilder.ImageBuilderComponent.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-imagebuilder.ImageBuilderComponent.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-imagebuilder.ImageBuilderComponentProp">ImageBuilderComponentProp</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |

---

##### `toString` <a name="toString" id="aws-imagebuilder.ImageBuilderComponent.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="aws-imagebuilder.ImageBuilderComponent.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="aws-imagebuilder.ImageBuilderComponent.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.fromComponentAttributes">fromComponentAttributes</a></code> | *No description.* |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-imagebuilder.ImageBuilderComponent.isConstruct"></a>

```typescript
import { ImageBuilderComponent } from 'aws-imagebuilder'

ImageBuilderComponent.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-imagebuilder.ImageBuilderComponent.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="aws-imagebuilder.ImageBuilderComponent.isOwnedResource"></a>

```typescript
import { ImageBuilderComponent } from 'aws-imagebuilder'

ImageBuilderComponent.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-imagebuilder.ImageBuilderComponent.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="aws-imagebuilder.ImageBuilderComponent.isResource"></a>

```typescript
import { ImageBuilderComponent } from 'aws-imagebuilder'

ImageBuilderComponent.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-imagebuilder.ImageBuilderComponent.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromComponentAttributes` <a name="fromComponentAttributes" id="aws-imagebuilder.ImageBuilderComponent.fromComponentAttributes"></a>

```typescript
import { ImageBuilderComponent } from 'aws-imagebuilder'

ImageBuilderComponent.fromComponentAttributes(scope: Construct, id: string, attrs: IImageBuilderComponent)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-imagebuilder.ImageBuilderComponent.fromComponentAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-imagebuilder.ImageBuilderComponent.fromComponentAttributes.parameter.id"></a>

- *Type:* string

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="aws-imagebuilder.ImageBuilderComponent.fromComponentAttributes.parameter.attrs"></a>

- *Type:* <a href="#aws-imagebuilder.IImageBuilderComponent">IImageBuilderComponent</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.property.componentArn">componentArn</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.property.componentName">componentName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.property.componentType">componentType</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageBuilderComponent.property.encrypted">encrypted</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-imagebuilder.ImageBuilderComponent.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="aws-imagebuilder.ImageBuilderComponent.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="aws-imagebuilder.ImageBuilderComponent.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `componentArn`<sup>Required</sup> <a name="componentArn" id="aws-imagebuilder.ImageBuilderComponent.property.componentArn"></a>

```typescript
public readonly componentArn: string;
```

- *Type:* string

---

##### `componentName`<sup>Required</sup> <a name="componentName" id="aws-imagebuilder.ImageBuilderComponent.property.componentName"></a>

```typescript
public readonly componentName: string;
```

- *Type:* string

---

##### `componentType`<sup>Required</sup> <a name="componentType" id="aws-imagebuilder.ImageBuilderComponent.property.componentType"></a>

```typescript
public readonly componentType: string;
```

- *Type:* string

---

##### `encrypted`<sup>Required</sup> <a name="encrypted" id="aws-imagebuilder.ImageBuilderComponent.property.encrypted"></a>

```typescript
public readonly encrypted: string;
```

- *Type:* string

---


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


### ImageRecipe <a name="ImageRecipe" id="aws-imagebuilder.ImageRecipe"></a>

- *Implements:* <a href="#aws-imagebuilder.IRecipe">IRecipe</a>

#### Initializers <a name="Initializers" id="aws-imagebuilder.ImageRecipe.Initializer"></a>

```typescript
import { ImageRecipe } from 'aws-imagebuilder'

new ImageRecipe(scope: Construct, id: string, props: ImageRecipeProp)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ImageRecipe.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageRecipe.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageRecipe.Initializer.parameter.props">props</a></code> | <code><a href="#aws-imagebuilder.ImageRecipeProp">ImageRecipeProp</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-imagebuilder.ImageRecipe.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-imagebuilder.ImageRecipe.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-imagebuilder.ImageRecipe.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-imagebuilder.ImageRecipeProp">ImageRecipeProp</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-imagebuilder.ImageRecipe.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-imagebuilder.ImageRecipe.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |

---

##### `toString` <a name="toString" id="aws-imagebuilder.ImageRecipe.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="aws-imagebuilder.ImageRecipe.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="aws-imagebuilder.ImageRecipe.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-imagebuilder.ImageRecipe.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-imagebuilder.ImageRecipe.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#aws-imagebuilder.ImageRecipe.isResource">isResource</a></code> | Check whether the given construct is a Resource. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-imagebuilder.ImageRecipe.isConstruct"></a>

```typescript
import { ImageRecipe } from 'aws-imagebuilder'

ImageRecipe.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-imagebuilder.ImageRecipe.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="aws-imagebuilder.ImageRecipe.isOwnedResource"></a>

```typescript
import { ImageRecipe } from 'aws-imagebuilder'

ImageRecipe.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-imagebuilder.ImageRecipe.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="aws-imagebuilder.ImageRecipe.isResource"></a>

```typescript
import { ImageRecipe } from 'aws-imagebuilder'

ImageRecipe.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-imagebuilder.ImageRecipe.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ImageRecipe.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-imagebuilder.ImageRecipe.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#aws-imagebuilder.ImageRecipe.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#aws-imagebuilder.ImageRecipe.property.recipeArn">recipeArn</a></code> | <code>string</code> | The ARN of the Recipe. |
| <code><a href="#aws-imagebuilder.ImageRecipe.property.recipeName">recipeName</a></code> | <code>string</code> | The Name of the Recipe. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-imagebuilder.ImageRecipe.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="aws-imagebuilder.ImageRecipe.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="aws-imagebuilder.ImageRecipe.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `recipeArn`<sup>Required</sup> <a name="recipeArn" id="aws-imagebuilder.ImageRecipe.property.recipeArn"></a>

```typescript
public readonly recipeArn: string;
```

- *Type:* string

The ARN of the Recipe.

---

##### `recipeName`<sup>Required</sup> <a name="recipeName" id="aws-imagebuilder.ImageRecipe.property.recipeName"></a>

```typescript
public readonly recipeName: string;
```

- *Type:* string

The Name of the Recipe.

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

### ContainerRecipeProp <a name="ContainerRecipeProp" id="aws-imagebuilder.ContainerRecipeProp"></a>

#### Initializer <a name="Initializer" id="aws-imagebuilder.ContainerRecipeProp.Initializer"></a>

```typescript
import { ContainerRecipeProp } from 'aws-imagebuilder'

const containerRecipeProp: ContainerRecipeProp = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ContainerRecipeProp.property.components">components</a></code> | <code><a href="#aws-imagebuilder.IImageBuilderComponent">IImageBuilderComponent</a>[]</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ContainerRecipeProp.property.parentImage">parentImage</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ContainerRecipeProp.property.targetRepository">targetRepository</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ContainerRecipeProp.property.version">version</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ContainerRecipeProp.property.dockerfileTemplateData">dockerfileTemplateData</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ContainerRecipeProp.property.dockerfileTemplateUri">dockerfileTemplateUri</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ContainerRecipeProp.property.recipeName">recipeName</a></code> | <code>string</code> | *No description.* |

---

##### `components`<sup>Required</sup> <a name="components" id="aws-imagebuilder.ContainerRecipeProp.property.components"></a>

```typescript
public readonly components: IImageBuilderComponent[];
```

- *Type:* <a href="#aws-imagebuilder.IImageBuilderComponent">IImageBuilderComponent</a>[]

---

##### `parentImage`<sup>Required</sup> <a name="parentImage" id="aws-imagebuilder.ContainerRecipeProp.property.parentImage"></a>

```typescript
public readonly parentImage: string;
```

- *Type:* string

---

##### `targetRepository`<sup>Required</sup> <a name="targetRepository" id="aws-imagebuilder.ContainerRecipeProp.property.targetRepository"></a>

```typescript
public readonly targetRepository: string;
```

- *Type:* string

---

##### `version`<sup>Required</sup> <a name="version" id="aws-imagebuilder.ContainerRecipeProp.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

---

##### `dockerfileTemplateData`<sup>Optional</sup> <a name="dockerfileTemplateData" id="aws-imagebuilder.ContainerRecipeProp.property.dockerfileTemplateData"></a>

```typescript
public readonly dockerfileTemplateData: string;
```

- *Type:* string

---

##### `dockerfileTemplateUri`<sup>Optional</sup> <a name="dockerfileTemplateUri" id="aws-imagebuilder.ContainerRecipeProp.property.dockerfileTemplateUri"></a>

```typescript
public readonly dockerfileTemplateUri: string;
```

- *Type:* string

---

##### `recipeName`<sup>Optional</sup> <a name="recipeName" id="aws-imagebuilder.ContainerRecipeProp.property.recipeName"></a>

```typescript
public readonly recipeName: string;
```

- *Type:* string

---

### EcrConfiguartion <a name="EcrConfiguartion" id="aws-imagebuilder.EcrConfiguartion"></a>

#### Initializer <a name="Initializer" id="aws-imagebuilder.EcrConfiguartion.Initializer"></a>

```typescript
import { EcrConfiguartion } from 'aws-imagebuilder'

const ecrConfiguartion: EcrConfiguartion = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.EcrConfiguartion.property.repositoryName">repositoryName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.EcrConfiguartion.property.tags">tags</a></code> | <code>string[]</code> | *No description.* |

---

##### `repositoryName`<sup>Required</sup> <a name="repositoryName" id="aws-imagebuilder.EcrConfiguartion.property.repositoryName"></a>

```typescript
public readonly repositoryName: string;
```

- *Type:* string

---

##### `tags`<sup>Required</sup> <a name="tags" id="aws-imagebuilder.EcrConfiguartion.property.tags"></a>

```typescript
public readonly tags: string[];
```

- *Type:* string[]

---

### ImageBuilderComponentProp <a name="ImageBuilderComponentProp" id="aws-imagebuilder.ImageBuilderComponentProp"></a>

#### Initializer <a name="Initializer" id="aws-imagebuilder.ImageBuilderComponentProp.Initializer"></a>

```typescript
import { ImageBuilderComponentProp } from 'aws-imagebuilder'

const imageBuilderComponentProp: ImageBuilderComponentProp = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ImageBuilderComponentProp.property.componentName">componentName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageBuilderComponentProp.property.platform">platform</a></code> | <code><a href="#aws-imagebuilder.ImageBuilderComponentPlatform">ImageBuilderComponentPlatform</a></code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageBuilderComponentProp.property.version">version</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageBuilderComponentProp.property.data">data</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageBuilderComponentProp.property.uri">uri</a></code> | <code>string</code> | *No description.* |

---

##### `componentName`<sup>Required</sup> <a name="componentName" id="aws-imagebuilder.ImageBuilderComponentProp.property.componentName"></a>

```typescript
public readonly componentName: string;
```

- *Type:* string

---

##### `platform`<sup>Required</sup> <a name="platform" id="aws-imagebuilder.ImageBuilderComponentProp.property.platform"></a>

```typescript
public readonly platform: ImageBuilderComponentPlatform;
```

- *Type:* <a href="#aws-imagebuilder.ImageBuilderComponentPlatform">ImageBuilderComponentPlatform</a>

---

##### `version`<sup>Required</sup> <a name="version" id="aws-imagebuilder.ImageBuilderComponentProp.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

---

##### `data`<sup>Optional</sup> <a name="data" id="aws-imagebuilder.ImageBuilderComponentProp.property.data"></a>

```typescript
public readonly data: string;
```

- *Type:* string

---

##### `uri`<sup>Optional</sup> <a name="uri" id="aws-imagebuilder.ImageBuilderComponentProp.property.uri"></a>

```typescript
public readonly uri: string;
```

- *Type:* string

---

### ImagePipelineProp <a name="ImagePipelineProp" id="aws-imagebuilder.ImagePipelineProp"></a>

#### Initializer <a name="Initializer" id="aws-imagebuilder.ImagePipelineProp.Initializer"></a>

```typescript
import { ImagePipelineProp } from 'aws-imagebuilder'

const imagePipelineProp: ImagePipelineProp = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ImagePipelineProp.property.imageScan">imageScan</a></code> | <code><a href="#aws-imagebuilder.ImageScanningConfiguration">ImageScanningConfiguration</a></code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImagePipelineProp.property.infrastructureConfiguration">infrastructureConfiguration</a></code> | <code><a href="#aws-imagebuilder.IInfrastructureConfiguration">IInfrastructureConfiguration</a></code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImagePipelineProp.property.containerRecipe">containerRecipe</a></code> | <code><a href="#aws-imagebuilder.IRecipe">IRecipe</a></code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImagePipelineProp.property.imageRecipe">imageRecipe</a></code> | <code><a href="#aws-imagebuilder.IRecipe">IRecipe</a></code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImagePipelineProp.property.pipelineName">pipelineName</a></code> | <code>string</code> | Name of the pipeline. |

---

##### `imageScan`<sup>Required</sup> <a name="imageScan" id="aws-imagebuilder.ImagePipelineProp.property.imageScan"></a>

```typescript
public readonly imageScan: ImageScanningConfiguration;
```

- *Type:* <a href="#aws-imagebuilder.ImageScanningConfiguration">ImageScanningConfiguration</a>

---

##### `infrastructureConfiguration`<sup>Required</sup> <a name="infrastructureConfiguration" id="aws-imagebuilder.ImagePipelineProp.property.infrastructureConfiguration"></a>

```typescript
public readonly infrastructureConfiguration: IInfrastructureConfiguration;
```

- *Type:* <a href="#aws-imagebuilder.IInfrastructureConfiguration">IInfrastructureConfiguration</a>

---

##### `containerRecipe`<sup>Optional</sup> <a name="containerRecipe" id="aws-imagebuilder.ImagePipelineProp.property.containerRecipe"></a>

```typescript
public readonly containerRecipe: IRecipe;
```

- *Type:* <a href="#aws-imagebuilder.IRecipe">IRecipe</a>

---

##### `imageRecipe`<sup>Optional</sup> <a name="imageRecipe" id="aws-imagebuilder.ImagePipelineProp.property.imageRecipe"></a>

```typescript
public readonly imageRecipe: IRecipe;
```

- *Type:* <a href="#aws-imagebuilder.IRecipe">IRecipe</a>

---

##### `pipelineName`<sup>Optional</sup> <a name="pipelineName" id="aws-imagebuilder.ImagePipelineProp.property.pipelineName"></a>

```typescript
public readonly pipelineName: string;
```

- *Type:* string
- *Default:* auto-generated

Name of the pipeline.

---

### ImageRecipeProp <a name="ImageRecipeProp" id="aws-imagebuilder.ImageRecipeProp"></a>

#### Initializer <a name="Initializer" id="aws-imagebuilder.ImageRecipeProp.Initializer"></a>

```typescript
import { ImageRecipeProp } from 'aws-imagebuilder'

const imageRecipeProp: ImageRecipeProp = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ImageRecipeProp.property.components">components</a></code> | <code><a href="#aws-imagebuilder.IImageBuilderComponent">IImageBuilderComponent</a>[]</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageRecipeProp.property.parentImage">parentImage</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageRecipeProp.property.version">version</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageRecipeProp.property.recipeName">recipeName</a></code> | <code>string</code> | *No description.* |

---

##### `components`<sup>Required</sup> <a name="components" id="aws-imagebuilder.ImageRecipeProp.property.components"></a>

```typescript
public readonly components: IImageBuilderComponent[];
```

- *Type:* <a href="#aws-imagebuilder.IImageBuilderComponent">IImageBuilderComponent</a>[]

---

##### `parentImage`<sup>Required</sup> <a name="parentImage" id="aws-imagebuilder.ImageRecipeProp.property.parentImage"></a>

```typescript
public readonly parentImage: string;
```

- *Type:* string

---

##### `version`<sup>Required</sup> <a name="version" id="aws-imagebuilder.ImageRecipeProp.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

---

##### `recipeName`<sup>Optional</sup> <a name="recipeName" id="aws-imagebuilder.ImageRecipeProp.property.recipeName"></a>

```typescript
public readonly recipeName: string;
```

- *Type:* string

---

### ImageScanningConfiguration <a name="ImageScanningConfiguration" id="aws-imagebuilder.ImageScanningConfiguration"></a>

#### Initializer <a name="Initializer" id="aws-imagebuilder.ImageScanningConfiguration.Initializer"></a>

```typescript
import { ImageScanningConfiguration } from 'aws-imagebuilder'

const imageScanningConfiguration: ImageScanningConfiguration = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.ImageScanningConfiguration.property.ecrConfiguration">ecrConfiguration</a></code> | <code><a href="#aws-imagebuilder.EcrConfiguartion">EcrConfiguartion</a></code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageScanningConfiguration.property.enabled">enabled</a></code> | <code>boolean</code> | *No description.* |

---

##### `ecrConfiguration`<sup>Required</sup> <a name="ecrConfiguration" id="aws-imagebuilder.ImageScanningConfiguration.property.ecrConfiguration"></a>

```typescript
public readonly ecrConfiguration: EcrConfiguartion;
```

- *Type:* <a href="#aws-imagebuilder.EcrConfiguartion">EcrConfiguartion</a>

---

##### `enabled`<sup>Required</sup> <a name="enabled" id="aws-imagebuilder.ImageScanningConfiguration.property.enabled"></a>

```typescript
public readonly enabled: boolean;
```

- *Type:* boolean

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
| <code><a href="#aws-imagebuilder.InfrastructureConfigurationProp.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | *No description.* |
| <code><a href="#aws-imagebuilder.InfrastructureConfigurationProp.property.subnet">subnet</a></code> | <code>aws-cdk-lib.aws_ec2.ISubnet</code> | *No description.* |

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

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="aws-imagebuilder.InfrastructureConfigurationProp.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]

---

##### `subnet`<sup>Optional</sup> <a name="subnet" id="aws-imagebuilder.InfrastructureConfigurationProp.property.subnet"></a>

```typescript
public readonly subnet: ISubnet;
```

- *Type:* aws-cdk-lib.aws_ec2.ISubnet

---


## Protocols <a name="Protocols" id="Protocols"></a>

### IComponentConfiguration <a name="IComponentConfiguration" id="aws-imagebuilder.IComponentConfiguration"></a>

- *Implemented By:* <a href="#aws-imagebuilder.IComponentConfiguration">IComponentConfiguration</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.IComponentConfiguration.property.component">component</a></code> | <code><a href="#aws-imagebuilder.IImageBuilderComponent">IImageBuilderComponent</a></code> | *No description.* |
| <code><a href="#aws-imagebuilder.IComponentConfiguration.property.parameter">parameter</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |

---

##### `component`<sup>Required</sup> <a name="component" id="aws-imagebuilder.IComponentConfiguration.property.component"></a>

```typescript
public readonly component: IImageBuilderComponent;
```

- *Type:* <a href="#aws-imagebuilder.IImageBuilderComponent">IImageBuilderComponent</a>

---

##### `parameter`<sup>Required</sup> <a name="parameter" id="aws-imagebuilder.IComponentConfiguration.property.parameter"></a>

```typescript
public readonly parameter: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

### IImageBuilderComponent <a name="IImageBuilderComponent" id="aws-imagebuilder.IImageBuilderComponent"></a>

- *Implemented By:* <a href="#aws-imagebuilder.ImageBuilderComponent">ImageBuilderComponent</a>, <a href="#aws-imagebuilder.IImageBuilderComponent">IImageBuilderComponent</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.IImageBuilderComponent.property.componentArn">componentArn</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.IImageBuilderComponent.property.componentName">componentName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.IImageBuilderComponent.property.componentType">componentType</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-imagebuilder.IImageBuilderComponent.property.encrypted">encrypted</a></code> | <code>string</code> | *No description.* |

---

##### `componentArn`<sup>Required</sup> <a name="componentArn" id="aws-imagebuilder.IImageBuilderComponent.property.componentArn"></a>

```typescript
public readonly componentArn: string;
```

- *Type:* string

---

##### `componentName`<sup>Required</sup> <a name="componentName" id="aws-imagebuilder.IImageBuilderComponent.property.componentName"></a>

```typescript
public readonly componentName: string;
```

- *Type:* string

---

##### `componentType`<sup>Required</sup> <a name="componentType" id="aws-imagebuilder.IImageBuilderComponent.property.componentType"></a>

```typescript
public readonly componentType: string;
```

- *Type:* string

---

##### `encrypted`<sup>Required</sup> <a name="encrypted" id="aws-imagebuilder.IImageBuilderComponent.property.encrypted"></a>

```typescript
public readonly encrypted: string;
```

- *Type:* string

---

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

### IRecipe <a name="IRecipe" id="aws-imagebuilder.IRecipe"></a>

- *Implemented By:* <a href="#aws-imagebuilder.ContainerRecipe">ContainerRecipe</a>, <a href="#aws-imagebuilder.ImageRecipe">ImageRecipe</a>, <a href="#aws-imagebuilder.IRecipe">IRecipe</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-imagebuilder.IRecipe.property.recipeArn">recipeArn</a></code> | <code>string</code> | The ARN of the Recipe. |
| <code><a href="#aws-imagebuilder.IRecipe.property.recipeName">recipeName</a></code> | <code>string</code> | The Name of the Recipe. |

---

##### `recipeArn`<sup>Required</sup> <a name="recipeArn" id="aws-imagebuilder.IRecipe.property.recipeArn"></a>

```typescript
public readonly recipeArn: string;
```

- *Type:* string

The ARN of the Recipe.

---

##### `recipeName`<sup>Required</sup> <a name="recipeName" id="aws-imagebuilder.IRecipe.property.recipeName"></a>

```typescript
public readonly recipeName: string;
```

- *Type:* string

The Name of the Recipe.

---

## Enums <a name="Enums" id="Enums"></a>

### ComponentType <a name="ComponentType" id="aws-imagebuilder.ComponentType"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-imagebuilder.ComponentType.TEST">TEST</a></code> | *No description.* |
| <code><a href="#aws-imagebuilder.ComponentType.BUILD">BUILD</a></code> | *No description.* |

---

##### `TEST` <a name="TEST" id="aws-imagebuilder.ComponentType.TEST"></a>

---


##### `BUILD` <a name="BUILD" id="aws-imagebuilder.ComponentType.BUILD"></a>

---


### ImageBuilderComponentPlatform <a name="ImageBuilderComponentPlatform" id="aws-imagebuilder.ImageBuilderComponentPlatform"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-imagebuilder.ImageBuilderComponentPlatform.LINUX">LINUX</a></code> | *No description.* |
| <code><a href="#aws-imagebuilder.ImageBuilderComponentPlatform.WINDOWS">WINDOWS</a></code> | *No description.* |

---

##### `LINUX` <a name="LINUX" id="aws-imagebuilder.ImageBuilderComponentPlatform.LINUX"></a>

---


##### `WINDOWS` <a name="WINDOWS" id="aws-imagebuilder.ImageBuilderComponentPlatform.WINDOWS"></a>

---

