import fs from 'fs-extra';
import path from 'path';
import AWS from 'aws-sdk';

import * as migrationsDir from '../env/migrationsDir';
import * as config from '../env/config';

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

async function configureMigrationsLogDbSchema() {
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

async function addMigrationToMigrationsLogDb(filename: string) {
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

async function doesMigrationsLogDbExists() {
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

export async function create(description: string) {
    let message;

    if (!description) {
        throw new Error('Missing parameter: description');
    }
    await migrationsDir.shouldExist();
    const migrationsDirPath = await migrationsDir.resolveMigrationsDirPath();

    // Check if there is a 'sample-migration.js' file in migrations dir - if there is, use that

    const source = (await migrationsDir.doesSampleMigrationExist())
        ? await migrationsDir.resolveSampleMigrationPath()
        : './node_modules/dynamo-data-migrations/src/samples/migration.ts';

    const filename = `${Date.now()}-${description.split(' ').join('_')}.ts`;
    const destination = path.join(migrationsDirPath, filename);

    try {
        await doesMigrationsLogDbExists();
    } catch {
        await configureMigrationsLogDbSchema();
    }

    try {
        await addMigrationToMigrationsLogDb(filename);
        await fs.copyFile(source, destination);
        message = `Created: migrations/${filename}`;
    } catch (error) {
        const e = error as Error;
        if (e.name === 'ResourceNotFoundException') {
            message = `Could not create migration.. Please run command again`;
        } else {
            throw error;
        }
    }

    return message;
}
