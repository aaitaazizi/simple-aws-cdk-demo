#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SimpleCDKdemoStack } from '../lib/simpleCDKdemo-stack';

const app = new cdk.App();
new SimpleCDKdemoStack(app, 'SimpleCDKdemoStack', {
    env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region:process.env.CDK_DEFAULT_REGION
    }
})

