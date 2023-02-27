## Introduction

`dynamo-data-migrations` is a database migration tool running in based on [migrate-mongo](https://github.com/seppevs/migrate-mongo), but with DynamoDb support. You can generate migration file with extension `.ts`, `.cjs` or `.mjs(ESM)` as per your source project language.


## Installation
```bash
$ npm install -g dynamo-data-migrations
```


## Usage
```
$ dynamo-data-migrations
Usage: dynamo-data-migrations [options] [command]
Options:
  -V, --version                   output the version number
  -h, --help                      display help for command

Commands:
  init                            initialize a new migration project
  create [description]            create a new database migration with the provided description
  up [options]                    run all pending database migrations against a provided profile.
  down [options]                  undo the last applied database migration against a provided profile.
  status [options]                print the changelog of the database against a provided profile
  help [command]                  display help for command
```


## Initialize a new project

1. Create a directory where you want to store your migrations for your dynamo db database and cd into it.

    ```bash
    $ mkdir sample-migrations
    $ cd sample-migrations
    ```

2. Initialize a new dynamo-data-migrations project in default `TS` specification.

    ```bash
    $ dynamo-data-migrations init
    Initialization successful. Please edit the generated config.json file
    ```


The above command did below mentioned 2 things:
   1. Create a sample `config.json` file 
   2. Create a `migrations` directory 

3. Edit the `config.json` file with AWS credentials of the AWS account against which you want to execute the up/down commands. The `migrationFileExtension` contains the extension as specified during `init` command. You can also provide your own `migrations` directory , incase you do not wish to use the default directory. Also provide the `migration type` for the type of migration file that you wish to generate, allowed values are `ts(for TypeScript)`, `cjs(For CommonJS style)` and `mjs(For ESM style)`

    ```javascript
         {
         "awsConfig" : [
            {
               "profile": "", 
               "region": "", 
               "accessKeyId": "", 
               "secretAccessKey": ""
            }
         ],
         "migrationsDir": "migrations",
         //Below field will be empty when initialized. Add suitable type as per source project type.
         "migrationType": "ts"
         }
   ```

   You can specify more than one profile. If `accessKeyId` and `secretAccessKey` are not provided, the credentials are loaded as per the AWS CredentialProviderChain. For more information, refer [Setting Credentials in Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html).


## Creating a new migration script
To create a new database migration script, just run the ````dynamo-data-migrations create [description]```` command. This will create a file  with the current timestamp prefixed in the filename. Also the extension of the migration file will be as per the specification mentioned during `init` phase.

For example:
````bash
$ dynamo-data-migrations create sample_migration_1
Created: migrations/1674549369392-sample_migration_1.ts
````

A new migration file is created in the 'migrations' directory with below contents
````javascript
import AWS from 'aws-sdk';
export async function up(ddb: AWS.DynamoDB) {
   // TODO write your migration here.
}

export async function down(ddb: AWS.DynamoDB) {
   // TODO write the statements to rollback your migration (if possible)
}

````
Edit the above content to perform your changes to your database. Add rollback statements in the `down` section.
The ````ddb```` object contains AWS SDK DynamoDB client instance


Always make sure the implementation matches the function signature:
* `async function up(ddb: any) { /* */ }` should return `Promise`


#### Example : To insert data in a table "CUSTOMER"
````javascript
export async function up(ddb: any) {
   var params = {
    TableName: 'CUSTOMER',
    Item: {
     'CUSTOMER_ID' : {N: '001'},
     'CUSTOMER_NAME' : {S: 'Richard Roe'}
    }
   };

   // Call DynamoDB to add the item to the table
   return new Promise((resolve,reject)=>{
    ddb.putItem(params, function(err, data) {
      if (err) {
       reject(err);
      } else {
       resolve(data);
      }
     });
   })
}

export async function down(ddb: any) {
    var params = {
    TableName: 'CUSTOMER',
    Key: {
     'CUSTOMER_ID': {N: '001'},
     'CUSTOMER_NAME': {S: 'Richard Roe'}
    }
   };

   // Call DynamoDB to delete the item from the table
   return new Promise((resolve,reject)=>{
    ddb.deleteItem(params, function(err, data) {
      if (err) {
       reject(err);
      } else {
       resolve(data);
      }
     });
   })
}

````
### Checking the status of the migrations
At any time, you can check which migrations are applied (or not)

````bash
$ dynamo-data-migrations status --profile dev

┌─────────────────────────────────────┬────────────┐
│ Filename                            │ Applied At │
├─────────────────────────────────────┼────────────┤
│ 1674549369392-sample_migration_1.ts │ PENDING    │
└─────────────────────────────────────┴────────────┘

````

### Migrate up
This command will apply all pending migrations in the migrations dir picking up files in ascending order as per the name.
If no profile is passed it will use AWS configuration from `default` profile.
If this is the first time that `up` command is executing against a particular AWS account then it also creates a `MIGRATIONS_LOG` table in the selected AWS account if it does not exist.

Example: For `default` profile
````bash
$  dynamo-data-migrations status up
MIGRATED UP: 1674549369392-sample_migration_1.ts
````
With profile `dev`
````bash
$  dynamo-data-migrations status up --profile dev
MIGRATED UP: 1674549369392-sample_migration_1.ts
````
If an an error occurred, it will stop and won't continue with the rest of the pending migrations

If we check the status again, we can see the last migration was successfully applied:
````bash
$ dynamo-data-migrations status
┌─────────────────────────────────────────┬──────────────────────────┐
│ Filename                                │ Applied At               │
├─────────────────────────────────────────┼──────────────────────────┤
│ 1674549369392-sample_migration_1.ts     │ 2016-06-08T20:13:30.415Z │
└─────────────────────────────────────────┴──────────────────────────┘
````
### Migrate down
With this command, dynamo-data-migrations will revert (only) the last applied migration

````bash
$ dynamo-data-migrations down
MIGRATED DOWN: 1674549369392-sample_migration_1.ts 
````

If we check the status again, we see that the reverted migration is pending again:
````bash
$ dynamo-data-migrations status
┌─────────────────────────────────────────┬────────────┐
│ Filename                                │ Applied At │
├─────────────────────────────────────────┼────────────┤
│ 1674549369392-sample_migration_1.ts     │ PENDING    │
└─────────────────────────────────────────┴────────────┘
````
You can also pass number of downshifts to be done i.e. you can perform upto last `n` installed migrations.

````bash
$ dynamo-data-migrations down --shift 2
MIGRATED DOWN: 1674549369392-sample_migration_1.ts 
MIGRATED DOWN: 1674549369392-sample_migration_2.ts 
````

## API Usage

```javascript
const {
   initAction,
   createAction,
   upAction,
   downAction,
   statusAction
} = require('dynamo-data-migrations');
```

### `initAction(ext) → Promise`

Initialize a new dynamo-data-migrations project with `TS` specification
```javascript
await initAction();
```
The above command did two things:
   1. Create a sample `config.json` file 
   2. Create a `migrations` directory 


Edit the config.ts file with AWS credentials of the AWS account against which you want to execute the up/down commands. Also add the appropriate `migration type` as described above.

### `createAction(description) → Promise<fileName>`

For example:
```javascript
const fileName = await createAction('migration1');
console.log('Created:', fileName);
```
A new migration file is created in the `migrations` directory.

### `upAction(profile) → Promise<Array<fileName>>`

Apply all pending migrations

```javascript
const migrated = await upAction();
migrated.forEach(fileName => console.log('Migrated:', fileName));
```

If an an error occurred, the promise will reject and won't continue with the rest of the pending migrations.

### `downAction(profile,downshift) → Promise<Array<fileName>>`

Revert  the last "n(downshift value)" applied migration

```javascript
const migratedDown = await downAction(2);
migratedDown.forEach(fileName => console.log('Migrated Down:', fileName));
```
