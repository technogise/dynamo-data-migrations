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

1. Initialize a new dynamo-data-migrations project.

    ```bash
    $ dynamo-data-migrations init

    Initialization successful. Please edit the generated config.json file
    ```

## Editing config.json
The `config.json` generated during the `init` phase conains configuration information as required to run the `up`, `down` and `satus` commands. Below is a brief description of the details specified in the file.
   1. `awsConfig`: This section is used to store AWS credentials and region of the AWS account against which you want to execute the up/down/status commands.
       You can specify multiple profiles, if profile is not specified it is considered as `default` profile. If `accessKeyId` and `secretAccessKey` are not provided, the credentials are loaded as per the AWS CredentialProviderChain. For more information, refer [Setting Credentials in Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html). **Region is mandatory for each profile**. 
   2. `migrationsDir`: This value specifies the directory containing the migration files. By default during `init` phase `migrations` directory is created. If you want to use your own migration directory, specify the path (relative or absolute) in this section and **ensure the directory is created before executing any up/down/status command**.
   3. `migrationType` : Ensure a value from `ts`,`cjs` and `mjs` is provided here, based on which the migration script will be generated.


## Creating a new migration script
To create a new database migration script, just run the ````dynamo-data-migrations create [description]```` command. This will create a file  with the current timestamp prefixed in the filename. The file extension will be determined by the `migrationType` field value in `config.json`.

````bash
$ dynamo-data-migrations create sample_migration_1
Created: migrations/1674549369392-sample_migration_1.ts
````

### Checking the status of the migrations
At any time, you can check which migrations are applied (or not). Pass the profile option when you want to run the command in specific environmeents(dev,int etc).

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
**If an an error occurred while migrating a particular file, it will stop and won't continue with the rest of the pending migrations.**

Example: For `default` profile
````bash
$  dynamo-data-migrations up
MIGRATED UP: 1674549369392-sample_migration_1.ts
MIGRATED UP: 1674549369492-sample_migration_2.ts
````
To execute profile `dev`
````bash
$  dynamo-data-migrations up --profile dev
MIGRATED UP: 1674549369392-sample_migration_1.ts
MIGRATED UP: 1674549369492-sample_migration_2.ts
````

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
With this command and without any parameters, dynamo-data-migrations will revert (only) the last applied migration.
You can also pass the number of downshifts to be done i.e. you can perform upto last `n` installed migrations. If you want to migrate all the applied migrations pass the `shift` argumen wih value `0`

Below will revert las 2 applied migrations.
````bash
$ dynamo-data-migrations down --shift 2
MIGRATED DOWN: 1674549369392-sample_migration_1.ts 
MIGRATED DOWN: 1674549369392-sample_migration_2.ts 
````