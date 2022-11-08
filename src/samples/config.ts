// In this file you can configure aws

import AWS from 'aws-sdk';

export const awsConfig = {
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
};
AWS.config.update(awsConfig);
