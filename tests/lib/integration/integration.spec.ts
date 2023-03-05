/* eslint-disable global-require */
/* eslint @typescript-eslint/no-var-requires: "off" */
import path from "path";
import fs from "fs-extra";
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { init } from "../../../src/lib/actions/init";
import { create } from "../../../src/lib/actions/create";
import { up } from "../../../src/lib/actions/up";
import * as migrationsDb from '../../../src/lib/env/migrationsDb';
import { down } from "../../../src/lib/actions/down";
import { status } from "../../../src/lib/actions/status";


let migrationFile1: string;
let migrationFile2: string;
let migrationFile3: string;

class ERROR extends Error {
  migrated?: string[];
}

describe("integration test for all types of supported migrations", () => {
  jest.setTimeout(60_000);
  const dynalite = require('dynalite');
  const dynaliteServer = dynalite();
  const ddb = new DynamoDB({
    endpoint: 'http://localhost:4567',
    sslEnabled: false,
    region: "local",
    accessKeyId: "dummy",
    secretAccessKey: "dummy",
  });
  beforeAll(() => {
    dynaliteServer.listen(4567, function run(err: any) {
      if (err) {
        throw err;
      }
    });
  });

  afterAll(() => {
    dynaliteServer.close();
    fs.removeSync(path.join(process.cwd(), 'migrations'));
    fs.removeSync(path.join(process.cwd(), 'config.json'));

  });

  beforeEach(() => {
    jest.spyOn(migrationsDb, "getDdb").mockResolvedValue(ddb);
  });

  afterEach(() => {
    fs.removeSync(path.join(process.cwd(), 'migrations'));
    fs.removeSync(path.join(process.cwd(), 'config.json'));
  });


  it("should properly execute init->create->up->down as per requirements for type cjs", async () => {
    await init();
    expect(fs.existsSync(path.join(process.cwd(), 'migrations'))).toBeTruthy();
    expect(fs.existsSync(path.join(process.cwd(), 'config.json'))).toBeTruthy();
    fs.copyFileSync(path.join(process.cwd(), 'tests/lib/templates/js/config.json'), path.join(process.cwd(), 'config.json'));
    migrationFile1 = await create('integrationTest_1');
    migrationFile2 = await create('integrationTest_2');
    migrationFile3 = await create('invalidMigration');
    fs.copyFileSync(path.join(process.cwd(), 'tests/lib/templates/js/migrationInvalid.cjs'), path.join(process.cwd(), 'migrations', migrationFile3));
    expect(fs.existsSync(path.join(process.cwd(), 'migrations', migrationFile1))).toBeTruthy();
    expect(fs.existsSync(path.join(process.cwd(), 'migrations', migrationFile2))).toBeTruthy();
    expect(migrationFile1.endsWith('.cjs')).toBeTruthy();
    expect(migrationFile2.endsWith('.cjs')).toBeTruthy();
    await executeAndAssert(ddb);
  });

  it("should properly execute init->create->up->down as per requirements for type mjs", async () => {
    await init();
    expect(fs.existsSync(path.join(process.cwd(), 'migrations'))).toBeTruthy();
    expect(fs.existsSync(path.join(process.cwd(), 'config.json'))).toBeTruthy();
    fs.copyFileSync(path.join(process.cwd(), 'tests/lib/templates/mjs/config.json'), path.join(process.cwd(), 'config.json'));
    migrationFile1 = await create('integrationTest_1');
    migrationFile2 = await create('integrationTest_2');
    migrationFile3 = await create('invalidMigration');
    fs.copyFileSync(path.join(process.cwd(), 'tests/lib/templates/mjs/migrationInvalid.mjs'), path.join(process.cwd(), 'migrations', migrationFile3));
    expect(fs.existsSync(path.join(process.cwd(), 'migrations', migrationFile1))).toBeTruthy();
    expect(fs.existsSync(path.join(process.cwd(), 'migrations', migrationFile2))).toBeTruthy();
    expect(migrationFile1.endsWith('.mjs')).toBeTruthy();
    expect(migrationFile2.endsWith('.mjs')).toBeTruthy();
    await executeAndAssert(ddb);
  });

  it("should properly execute init->create->up->down as per requirements for type ts", async () => {
    await init();
    expect(fs.existsSync(path.join(process.cwd(), 'migrations'))).toBeTruthy();
    expect(fs.existsSync(path.join(process.cwd(), 'config.json'))).toBeTruthy();
    fs.copyFileSync(path.join(process.cwd(), 'tests/lib/templates/ts/config.json'), path.join(process.cwd(), 'config.json'));
    migrationFile1 = await create('integrationTest_1');
    migrationFile2 = await create('integrationTest_2');
    migrationFile3 = await create('invalidMigration');
    fs.copyFileSync(path.join(process.cwd(), 'tests/lib/templates/ts/migrationInvalid.ts'), path.join(process.cwd(), 'migrations', migrationFile3));
    expect(fs.existsSync(path.join(process.cwd(), 'migrations', migrationFile1))).toBeTruthy();
    expect(fs.existsSync(path.join(process.cwd(), 'migrations', migrationFile2))).toBeTruthy();
    expect(migrationFile1.endsWith('.ts')).toBeTruthy();
    expect(migrationFile2.endsWith('.ts')).toBeTruthy();
    await executeAndAssert(ddb);
  });

});

async function executeAndAssert(ddb: DynamoDB) {
  await validateAllUp(ddb);
  await validateOneRollback(ddb);
  await validateOneUp(ddb);
  await validateAllRollback(ddb);
}

async function validateAllRollback(ddb: AWS.DynamoDB) {
  const rolledBackFiles = await down('default', 0);
  expect(rolledBackFiles).toHaveLength(2);
  expect(rolledBackFiles[0]).toEqual(migrationFile2);
  expect(rolledBackFiles[1]).toEqual(migrationFile1);
  const migrations = await status();
  expect(migrations).toHaveLength(3);
  expect(migrations[0].appliedAt).toEqual('PENDING');
  expect(migrations[1].appliedAt).toEqual('PENDING');
  expect(migrations[2].appliedAt).toEqual('PENDING');
  await assertEntriesInMigrationLogDb(ddb, 0, []);
}

async function validateOneUp(ddb: AWS.DynamoDB) {
  let migrated: string[];
  try {
    migrated = await up();
  }
  catch (error) {
    const e = error as ERROR;
    migrated = e.migrated || [];
  };
  expect(migrated).toHaveLength(1);
  expect(migrated[0]).toEqual(migrationFile2);
  const migrations = await status();
  expect(migrations).toHaveLength(3);
  expect(migrations[1].appliedAt).not.toEqual('PENDING');
  expect(migrations[2].appliedAt).toEqual('PENDING');
  await assertEntriesInMigrationLogDb(ddb, 2, [migrationFile1, migrationFile2]);

}

async function validateOneRollback(ddb: AWS.DynamoDB) {
  const rolledBackFiles = await down()
  expect(rolledBackFiles).toHaveLength(1);
  expect(rolledBackFiles[0]).toEqual(migrationFile2);
  const migrations = await status();
  expect(migrations).toHaveLength(3);
  expect(migrations[1].appliedAt).toEqual('PENDING');
  expect(migrations[2].appliedAt).toEqual('PENDING');
  await assertEntriesInMigrationLogDb(ddb, 1, [migrationFile1]);
}

async function validateAllUp(ddb: AWS.DynamoDB) {
  let migrated: string[];
  try {
    migrated = await up();
  }
  catch (error) {
    const e = error as ERROR;
    migrated = e.migrated || [];
  }
  expect(migrated).toHaveLength(2);
  expect(migrated[0]).toEqual(migrationFile1);
  expect(migrated[1]).toEqual(migrationFile2);
  const migrations = await status();
  expect(migrations).toHaveLength(3);
  expect(migrations[0].appliedAt).not.toEqual('PENDING');
  expect(migrations[1].appliedAt).not.toEqual('PENDING');
  expect(migrations[2].appliedAt).toEqual('PENDING');
  await assertEntriesInMigrationLogDb(ddb, 2, [migrationFile1, migrationFile2]);
}


async function assertEntriesInMigrationLogDb(ddb: DynamoDB, noOfEntries: number, fileNames: string[]) {
  const params = {
    TableName: 'MIGRATIONS_LOG_DB',
  };
  const migrationLogResults: string[] = [];
  const items = await ddb.scan(params).promise();
  if (items.Items) {
    migrationLogResults.push(...items.Items.map((item) => { return item.FILE_NAME.S || ""; }));
  }
  expect(migrationLogResults).toHaveLength(noOfEntries);
  expect(migrationLogResults).toEqual(expect.arrayContaining(fileNames));
}

