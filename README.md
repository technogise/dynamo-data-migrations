# Dynamo-Data-migrations
 dynamo-data-migration is a database migration tool running in `NodeJS` and `Typescript`. Based on migrate-mongo (https://github.com/seppevs/migrate-mongo), but with DynamoDb support.

 ## Output Module
The module is compiled to a `CommonJS` module.

 ## Limitations
1) The project currently works with NodJS project of type `CommonJS i.e type=module`. It does not support `ESM` module currently.</br>
2) Project generates `config` and `migration` files with `.ts` extension. Support to generate the same files with`.js` extension is currently not present.

## Installation
````bash
$ npm install -g dynamo-data-migrations
````
## CLI Usage
````
$ dynamo-data-migrations
Usage: dynamo-data-migrations [options] [command]
Options:
  -V, --version                   output the version number
  -h, --help                      display help for command

Commands:
  init                            initialize a new migration project
  create [options] [description]  create a new database migration with the provided description
  up [options]                    run all pending database migrations against a provided profile.
  down [options]                  undo the last applied database migration against a provided profile.
  status [options]                print the changelog of the database against a provided profile
  help [command]                  display help for command
  ````
### Initialize a new project
Make sure you have [Node.js](https://nodejs.org/en/)  installed.  

Create a directory where you want to store your migrations for your dynamo db database and cd into it. 
````bash
$ mkdir sample-migrations
$ cd sample-migrations
````

Initialize a new dynamo-data-migrations project
````bash
$ dynamo-data-migrations init
Initialization successful. Please edit the generated config.ts file
````
The above command did three things: 
1. create a setup.db folder
1. create a sample ' config.ts' file inside setup.db folder 
2. create a 'migrations' directory inside setup.db folder

Edit the `config.ts` file with AWS credentials of the AWS account against which you want to execute the up/down commands. You can specify 
more than one profile. If profile is omitted, it is considered as `default` profile. `Region` is mandatory to be provided, but 
`accessKeyId` and  `secretAccessKey` are optional, if provided they are used as AWSCredentials, if not provided then credentials are picked up from credentials file in ~aws folder of the executing machine. If it cannot find the credentials file, it will try to load from env variables if provided. More details: `https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html`

````javascript
export const awsConfig = [
    {
        profile: '', // Can be a value to denote env. Eg. dev,test,prod. If not provided it is considered to be default
        region: '', // Mandatory to be provided for each profile
        accessKeyId: '', // Optional. If not provided credentials are taken from shared credentials file.
        secretAccessKey: '', // Optional. If not provided credentials are taken from shared credentials file.
    }
];

````

### Creating a new migration script
To create a new database migration script, just run the ````dynamo-data-migrations create [description]```` command. This will create a file  with the current timestamp prefixed in the filename.

For example: For ````default```` profile
````bash
$ dynamo-data-migrations create sample_migration_1
Created: migrations/1674549369392-sample_migration_1.ts
````
For ````dev```` profile

````bash
$ dynamo-data-migrations create sample_migration_1 --profile dev
Created: migrations/1674549369392-sample_migration_1.ts
````
If this is the first time that `create` command is executing against a particular AWS account then it also creates a `MIGRATIONS_LOG` table in the selected AWS account.

A new migration file is created in the 'migrations' directory
````javascript
export async function up(ddb: any) {
    // TODO write your migration here.
}

export async function down(ddb: any) {
    // TODO write the statements to rollback your migration (if possible)
}

````

Edit this content so it actually performs changes to your database. Don't forget to write the down part as well.
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

### `initAction() → Promise`

Initialize a new dynamo-data-migrations project
```javascript
await initAction();
```
The above command did three things:

1) Create a `setup.db` folder
2) Create a sample `config.ts` file inside setup.db folder
3) Create a `migrations` directory inside setup.db folder

Edit the config.ts file with AWS credentials of the AWS account against which you want to execute the up/down commands. 

### `createAction(description,profile) → Promise<fileName>`

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

