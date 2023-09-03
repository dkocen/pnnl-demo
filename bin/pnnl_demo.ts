#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import PipelineConstruct from '../lib/pipeline-construct';

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;
const env = { account, region };

const app = new cdk.App();
new PipelineConstruct(app, 'PipelineConstruct', {
    env
});