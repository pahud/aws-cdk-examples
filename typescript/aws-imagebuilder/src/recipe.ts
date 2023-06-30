import {
  Resource, Names,
  aws_imagebuilder as imagebuilder,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface IRecipe {
  /**
   * The ARN of the Recipe.
   */
  readonly recipeArn: string;
  /**
   * The Name of the Recipe.
   */
  readonly recipeName: string;
}

// export interface IImageRecipe {
//   /**
//    * The ARN of the Recipe.
//    */
//   readonly recipeArn: string;
//   /**
//    * The Name of the Recipe.
//    */
//   readonly recipeName: string;
// }

// export interface IContainerRecipe {
//   /**
//    * The ARN of the Recipe.
//    */
//   readonly recipeArn: string;
//   /**
//    * The Name of the Recipe.
//    */
//   readonly recipeName: string;
// }

export interface ImageRecipeProp {
  readonly recipeName?: string;
  readonly components: IImageBuilderComponent[];
  readonly parentImage: string;
  readonly version: string;
}

export interface ContainerRecipeProp {
  readonly components: IImageBuilderComponent[];
  // readonly containerType: string;
  readonly recipeName?: string;
  readonly parentImage: string;
  readonly targetRepository: string;
  readonly version: string;
  readonly dockerfileTemplateData?: string;
  readonly dockerfileTemplateUri?: string;
}

export interface IImageBuilderComponent {
  readonly componentArn: string;
  readonly encrypted: string;
  readonly componentName: string;
  readonly componentType: string;
}

export enum ComponentType {
  TEST = 'TEST',
  BUILD = 'BUILD',
};

export interface ImageBuilderComponentProp {
  readonly componentName: string;
  readonly platform: ImageBuilderComponentPlatform;
  readonly version: string;
  readonly data?: string;
  readonly uri?: string;
}

export enum ImageBuilderComponentPlatform {
  LINUX = 'Linux',
  WINDOWS = 'Windows',
}

export class ImageBuilderComponent extends Resource implements IImageBuilderComponent {
  public static fromComponentAttributes(scope: Construct, id: string, attrs: IImageBuilderComponent): IImageBuilderComponent {
    class Import extends Resource {
      public componentArn = attrs.componentArn;
      public encrypted = attrs.encrypted;
      public componentName = attrs.componentName;
      public componentType = attrs.componentType;
    }
    return new Import(scope, id);
  }

  readonly componentArn: string;
  readonly encrypted: string;
  readonly componentName: string;
  readonly componentType: string;

  constructor(scope: Construct, id: string, props: ImageBuilderComponentProp) {
    super(scope, id);

    const resource = new imagebuilder.CfnComponent(this, 'Resource', {
      name: props.componentName ?? Names.uniqueResourceName(this, { maxLength: 128, allowedSpecialCharacters: '-_' }),
      platform: props.platform,
      version: props.version,
      data: props.data,
      uri: props.uri,
    });

    this.componentArn = resource.attrArn;
    this.encrypted = resource.attrEncrypted.toString();
    this.componentName = resource.attrName;
    this.componentType = resource.attrType.valueOf();
  }
}

export interface IComponentConfiguration {
  readonly component: IImageBuilderComponent;
  readonly parameter: { [key: string]: string};
}

export class ImageRecipe extends Resource implements IRecipe {
  readonly recipeArn: string;
  readonly recipeName: string;

  constructor(scope: Construct, id: string, props: ImageRecipeProp) {
    super(scope, id);

    const resource = new imagebuilder.CfnImageRecipe(this, 'Resource', {
      name: props.recipeName ?? Names.uniqueResourceName(this, { maxLength: 128, allowedSpecialCharacters: '-_' }),
      components: props.components?.map( c => ({
        componentArn: c.componentArn,
      })),
      parentImage: props.parentImage,
      version: props.version,
    });

    this.recipeArn = resource.attrArn;
    this.recipeName = resource.attrName;
  }
}

export class ContainerRecipe extends Resource implements IRecipe {
  readonly recipeArn: string;
  readonly recipeName: string;

  constructor(scope: Construct, id: string, props: ContainerRecipeProp) {
    super(scope, id);

    const resource = new imagebuilder.CfnContainerRecipe(this, 'Resource', {
      name: props.recipeName ?? Names.uniqueResourceName(this, { maxLength: 128, allowedSpecialCharacters: '-_' }),
      components: props.components?.map( c => ({
        componentArn: c.componentArn,
      })),
      parentImage: props.parentImage,
      containerType: 'DOCKER',
      version: props.version,
      targetRepository: {
        repositoryName: props.targetRepository,
        service: 'ECR',
      },
      dockerfileTemplateData: props.dockerfileTemplateData,
      dockerfileTemplateUri: props.dockerfileTemplateUri,
    });

    this.recipeArn = resource.attrArn;
    this.recipeName = resource.attrName;
  }
}