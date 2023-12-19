#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AlbListenerruleTaggerStack } from '../lib/alb-listenerrule-tagger-stack';

const app = new cdk.App();
new AlbListenerruleTaggerStack(app, 'AlbListenerruleTaggerStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});