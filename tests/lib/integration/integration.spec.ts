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
import { status } from "../../../src/lib/actions/status"

let migrationFile1: string;
let migrationFile2: string;


describe("integration test for all types of supported migrations", () => {
  jest.setTimeout(30_000);
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
    dynaliteServer.listen(4567,function run(err: any) {
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
    expect(fs.existsSync(path.join(process.cwd(), 'migrations', migrationFile1))).toBeTruthy();
    expect(fs.existsSync(path.join(process.cwd(), 'migrations', migrationFile2))).toBeTruthy();
    expect(migrationFile1.endsWith('.cjs')).toBeTruthy();
    expect(migrationFile2.endsWith('.cjs')).toBeTruthy();
    await validateAllUp();
    await validateOneRollback();
    await validateOneUp();
    await validateAllRollback();
  });

  it("should properly execute init->create->up->down as per requirements for type mjs", async () => {
    await init();
    expect(fs.existsSync(path.join(process.cwd(), 'migrations'))).toBeTruthy();
    expect(fs.existsSync(path.join(process.cwd(), 'config.json'))).toBeTruthy();
    fs.copyFileSync(path.join(process.cwd(), 'tests/lib/templates/mjs/config.json'), path.join(process.cwd(), 'config.json'));
    migrationFile1 = await create('integrationTest_1');
    migrationFile2 = await create('integrationTest_2');
    expect(fs.existsSync(path.join(process.cwd(), 'migrations', migrationFile1))).toBeTruthy();
    expect(fs.existsSync(path.join(process.cwd(), 'migrations', migrationFile2))).toBeTruthy();
    expect(migrationFile1.endsWith('.mjs')).toBeTruthy();
    expect(migrationFile2.endsWith('.mjs')).toBeTruthy();
    await validateAllUp();
    await validateOneRollback();
    await validateOneUp();
    await validateAllRollback();
  });

  it("should properly execute init->create->up->down as per requirements for type ts", async () => {
    await init();
    expect(fs.existsSync(path.join(process.cwd(), 'migrations'))).toBeTruthy();
    expect(fs.existsSync(path.join(process.cwd(), 'config.json'))).toBeTruthy();
    fs.copyFileSync(path.join(process.cwd(), 'tests/lib/templates/ts/config.json'), path.join(process.cwd(), 'config.json'));
    migrationFile1 = await create('integrationTest_1');
    migrationFile2 = await create('integrationTest_2');
    expect(fs.existsSync(path.join(process.cwd(), 'migrations', migrationFile1))).toBeTruthy();
    expect(fs.existsSync(path.join(process.cwd(), 'migrations', migrationFile2))).toBeTruthy();
    expect(migrationFile1.endsWith('.ts')).toBeTruthy();
    expect(migrationFile2.endsWith('.ts')).toBeTruthy();
    await validateAllUp();
    await validateOneRollback();
    await validateOneUp();
    await validateAllRollback();
  });

});

async function validateAllRollback() {
  const rolledBackFiles = await down('default', 0);
  expect(rolledBackFiles).toHaveLength(2);
  expect(rolledBackFiles[0]).toEqual(migrationFile2);
  expect(rolledBackFiles[1]).toEqual(migrationFile1);
  const migrations = await status();
  expect(migrations).toHaveLength(2);
  expect(migrations[0].appliedAt).toEqual('PENDING');
  expect(migrations[1].appliedAt).toEqual('PENDING');
}

async function validateOneUp() {
  const migrated = await up();
  expect(migrated).toHaveLength(1);
  expect(migrated[0]).toEqual(migrationFile2);
  const migrations = await status();
  expect(migrations).toHaveLength(2);
  expect(migrations[1].appliedAt).not.toEqual('PENDING');
}

async function validateOneRollback() {
  const rolledBackFiles = await down()
  expect(rolledBackFiles).toHaveLength(1);
  expect(rolledBackFiles[0]).toEqual(migrationFile2);
  const migrations = await status();
  expect(migrations).toHaveLength(2);
  expect(migrations[1].appliedAt).toEqual('PENDING');
}

async function validateAllUp() {
  const migrated = await up()
  expect(migrated).toHaveLength(2);
  expect(migrated[0]).toEqual(migrationFile1);
  expect(migrated[1]).toEqual(migrationFile2);
  const migrations = await status();
  expect(migrations).toHaveLength(2);
  expect(migrations[0].fileName).toEqual(migrationFile1);
  expect(migrations[1].fileName).toEqual(migrationFile2);
}

