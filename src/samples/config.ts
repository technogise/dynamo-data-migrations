/* In this file you can configure aws for migrations. 
Region is mandatory to be provided. Others are optional. Default value for profile is "default" */

export const awsConfig = [
    {
        profile: '', // Can be a value to denote env. Eg. dev,test,prod. If not provided it is considered to be default
        region: '', // Mandatory to be provided for each profile
        accessKeyId: '', // Optional. If not provided credentials are taken from shared credentials file.
        secretAccessKey: '', // Optional. If not provided credentials are taken from shared credentials file.
    },
];
