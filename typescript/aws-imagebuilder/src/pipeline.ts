import {
  Resource, Names,
  aws_imagebuilder as imagebuilder,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IInfrastructureConfiguration } from './infrastructure';
import { IRecipe } from './recipe';


export interface EcrConfiguartion {
  readonly tags: string[];
  readonly repositoryName: string;
}

export interface ImageScanningConfiguration {
  readonly ecrConfiguration: EcrConfiguartion;
  readonly enabled: boolean;
}

export interface IImagePipeline {
  /**
   * The ARN of the pipeline.
   */
  readonly imagePipelineArn: string;
  /**
   * The Name of the pipeline.
   */
  readonly imagePipelineName: string;
}

export interface ImagePipelineProp {
  /**
   * Name of the pipeline.
   *
   * @default - auto-generated
   */
  readonly pipelineName?: string;
  readonly infrastructureConfiguration: IInfrastructureConfiguration;
  readonly imageRecipe?: IRecipe;
  readonly containerRecipe?: IRecipe;
  readonly imageScan: ImageScanningConfiguration;
}

export class ImagePipeline extends Resource implements IImagePipeline {
  readonly imagePipelineArn: string;
  readonly imagePipelineName: string;

  constructor(scope: Construct, id: string, props: ImagePipelineProp) {
    super(scope, id);

    const resource = new imagebuilder.CfnImagePipeline(this, 'Resource', {
      name: props.pipelineName ?? Names.uniqueResourceName(this, { maxLength: 128, allowedSpecialCharacters: '-_' }),
      infrastructureConfigurationArn: props.infrastructureConfiguration.infrastructureConfigurationArn,
      imageRecipeArn: props.imageRecipe?.recipeArn,
      containerRecipeArn: props.containerRecipe?.recipeArn,
      imageScanningConfiguration: {
        imageScanningEnabled: props.imageScan.enabled,
        ecrConfiguration: {
          containerTags: props.imageScan.ecrConfiguration.tags,
          repositoryName: props.imageScan.ecrConfiguration.repositoryName,
        },
      },
    });

    this.imagePipelineArn = resource.attrArn;
    this.imagePipelineName = resource.attrName;

  }
}