# replace this
# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### MongoDBAtlasBootstrap <a name="MongoDBAtlasBootstrap" id="mongodb-atlas.MongoDBAtlasBootstrap"></a>

Generate the CFN extension execution role.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html)

#### Initializers <a name="Initializers" id="mongodb-atlas.MongoDBAtlasBootstrap.Initializer"></a>

```typescript
import { MongoDBAtlasBootstrap } from 'mongodb-atlas'

new MongoDBAtlasBootstrap(scope: Construct, id: string, props?: MongoDBAtlasBootstrapProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.Initializer.parameter.props">props</a></code> | <code><a href="#mongodb-atlas.MongoDBAtlasBootstrapProps">MongoDBAtlasBootstrapProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.MongoDBAtlasBootstrap.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.MongoDBAtlasBootstrap.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="mongodb-atlas.MongoDBAtlasBootstrap.Initializer.parameter.props"></a>

- *Type:* <a href="#mongodb-atlas.MongoDBAtlasBootstrapProps">MongoDBAtlasBootstrapProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="mongodb-atlas.MongoDBAtlasBootstrap.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="mongodb-atlas.MongoDBAtlasBootstrap.isConstruct"></a>

```typescript
import { MongoDBAtlasBootstrap } from 'mongodb-atlas'

MongoDBAtlasBootstrap.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="mongodb-atlas.MongoDBAtlasBootstrap.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.property.profile">profile</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrap.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="mongodb-atlas.MongoDBAtlasBootstrap.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `profile`<sup>Required</sup> <a name="profile" id="mongodb-atlas.MongoDBAtlasBootstrap.property.profile"></a>

```typescript
public readonly profile: string;
```

- *Type:* string

---

##### `role`<sup>Required</sup> <a name="role" id="mongodb-atlas.MongoDBAtlasBootstrap.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

---


### MongoSecretProfile <a name="MongoSecretProfile" id="mongodb-atlas.MongoSecretProfile"></a>

#### Initializers <a name="Initializers" id="mongodb-atlas.MongoSecretProfile.Initializer"></a>

```typescript
import { MongoSecretProfile } from 'mongodb-atlas'

new MongoSecretProfile(scope: Construct, id: string, profileName: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.MongoSecretProfile.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#mongodb-atlas.MongoSecretProfile.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#mongodb-atlas.MongoSecretProfile.Initializer.parameter.profileName">profileName</a></code> | <code>string</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="mongodb-atlas.MongoSecretProfile.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="mongodb-atlas.MongoSecretProfile.Initializer.parameter.id"></a>

- *Type:* string

---

##### `profileName`<sup>Required</sup> <a name="profileName" id="mongodb-atlas.MongoSecretProfile.Initializer.parameter.profileName"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.MongoSecretProfile.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="mongodb-atlas.MongoSecretProfile.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#mongodb-atlas.MongoSecretProfile.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="mongodb-atlas.MongoSecretProfile.isConstruct"></a>

```typescript
import { MongoSecretProfile } from 'mongodb-atlas'

MongoSecretProfile.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="mongodb-atlas.MongoSecretProfile.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.MongoSecretProfile.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="mongodb-atlas.MongoSecretProfile.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---



## Classes <a name="Classes" id="Classes"></a>

### MongoDBAtlasBootstrapProps <a name="MongoDBAtlasBootstrapProps" id="mongodb-atlas.MongoDBAtlasBootstrapProps"></a>

#### Initializers <a name="Initializers" id="mongodb-atlas.MongoDBAtlasBootstrapProps.Initializer"></a>

```typescript
import { MongoDBAtlasBootstrapProps } from 'mongodb-atlas'

new MongoDBAtlasBootstrapProps()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrapProps.property.roleName">roleName</a></code> | <code>string</code> | The IAM role name for CloudFormation Extension Execution. |
| <code><a href="#mongodb-atlas.MongoDBAtlasBootstrapProps.property.secretProfile">secretProfile</a></code> | <code>string</code> | The secret profile name for MongoDB Atlas. |

---

##### `roleName`<sup>Optional</sup> <a name="roleName" id="mongodb-atlas.MongoDBAtlasBootstrapProps.property.roleName"></a>

```typescript
public readonly roleName: string;
```

- *Type:* string
- *Default:* auto generat the name.

The IAM role name for CloudFormation Extension Execution.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html)

---

##### `secretProfile`<sup>Optional</sup> <a name="secretProfile" id="mongodb-atlas.MongoDBAtlasBootstrapProps.property.secretProfile"></a>

```typescript
public readonly secretProfile: string;
```

- *Type:* string
- *Default:* generate a dummy secret.

The secret profile name for MongoDB Atlas.

> [https://github.com/mongodb/mongodbatlas-cloudformation-resources/tree/master#2-configure-your-profile](https://github.com/mongodb/mongodbatlas-cloudformation-resources/tree/master#2-configure-your-profile)

---



