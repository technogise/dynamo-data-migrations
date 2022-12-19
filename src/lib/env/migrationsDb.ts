import AWS from 'aws-sdk';
import * as config from './config';

async function getDdb() {
    const awsConfig = await config.read();
    const awsCredentials = {
        region: awsConfig.region,
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
    };
    AWS.config.update(awsCredentials);

    return new AWS.DynamoDB({ apiVersion: '2012-08-10' });
}

export async function configureMigrationsLogDbSchema() {
    const ddb = await getDdb();

    const params = {
        AttributeDefinitions: [
            {
                AttributeName: 'FILE_NAME',
                AttributeType: 'S',
            },
            {
                AttributeName: 'APPLIED_AT',
                AttributeType: 'S',
            },
        ],
        KeySchema: [
            {
                AttributeName: 'FILE_NAME',
                KeyType: 'HASH',
            },
            {
                AttributeName: 'APPLIED_AT',
                KeyType: 'RANGE',
            },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
        TableName: 'MIGRATIONS_LOG_DB',
        StreamSpecification: {
            StreamEnabled: false,
        },
    };

    return new Promise((resolve, reject) => {
        // Call DynamoDB to create the table
        ddb.createTable(params, async function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

export async function addMigrationToMigrationsLogDb(filename: string) {
    const ddb = await getDdb();
    const params = {
        TableName: 'MIGRATIONS_LOG_DB',
        Item: {
            FILE_NAME: { S: filename },
            APPLIED_AT: { S: 'PENDING' },
        },
    };

    // Call DynamoDB to add the item to the table

    return new Promise((resolve, reject) => {
        ddb.putItem(params, async function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

export async function doesMigrationsLogDbExists() {
    const ddb = await getDdb();

    const params = {
        TableName: 'MIGRATIONS_LOG_DB',
    };

    return new Promise((resolve, reject) => {
        ddb.describeTable(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}
