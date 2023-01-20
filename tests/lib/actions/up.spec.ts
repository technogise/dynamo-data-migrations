import AWS from 'aws-sdk';
import sinon from 'sinon';
import { up } from "../../../src/lib/actions/up"

import * as statusModule from '../../../src/lib/actions/status';
import * as migrationsDir from '../../../src/lib/env/migrationsDir';
import * as migrationsDb from '../../../src/lib/env/migrationsDb';

describe("up", () => {
  let statusModuleStatus: jest.SpyInstance;
  let firstPendingMigration: { up: jest.Mock };
  let secondPendingMigration: { up: jest.Mock };
  let migrationsDirLoadMigration: jest.SpyInstance;
  let migrationsDbAddMigrationToMigrationsLogDb: jest.SpyInstance;
  const awsConfig = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

  beforeEach(() => {
    statusModuleStatus = jest.spyOn(statusModule, "status").mockReturnValue(
      Promise.resolve([{
        fileName: "20160605123224-first_applied_migration.ts",
        appliedAt: new Date().toJSON()
      },
      {
        fileName: "20160606093207-second_applied_migration.ts",
        appliedAt: new Date().toJSON()
      },
      {
        fileName: "20160607173840-first_pending_migration.ts",
        appliedAt: "PENDING"
      },
      {
        fileName: "20160608060209-second_pending_migration.ts",
        appliedAt: "PENDING"
      }])

    );

    firstPendingMigration = {
      up: jest.fn().mockReturnValue(Promise.resolve())
    }

    secondPendingMigration = {
      up: jest.fn().mockReturnValue(Promise.resolve())
    }

    migrationsDirLoadMigration = jest.spyOn(migrationsDir, "loadFilesToBeMigrated")
      .mockReturnValueOnce(firstPendingMigration)
      .mockReturnValueOnce(secondPendingMigration)

    jest.spyOn(migrationsDb, "getDdb").mockImplementation(() => { return awsConfig; });

    migrationsDbAddMigrationToMigrationsLogDb = jest.spyOn(migrationsDb, "addMigrationToMigrationsLogDb").mockReturnValue(Promise.resolve());
  });


  it("should call status and load all the pending migrations", async () => {
    await up();
    expect(statusModuleStatus).toBeCalled();
    expect(migrationsDirLoadMigration).toBeCalledTimes(2);
    expect(migrationsDirLoadMigration).nthCalledWith(1, "20160607173840-first_pending_migration.ts");
    expect(migrationsDirLoadMigration).nthCalledWith(2, "20160608060209-second_pending_migration.ts");
  });

  it("should populate the migrationsLogDb with info about the upgraded migrations", async () => {
    const clock = sinon.useFakeTimers(
      new Date("2016-06-09T08:07:00.077Z").getTime()
    );
    await up();
    expect(migrationsDbAddMigrationToMigrationsLogDb).toBeCalledTimes(2);
    expect(migrationsDbAddMigrationToMigrationsLogDb).nthCalledWith(1, {
      appliedAt: new Date("2016-06-09T08:07:00.077Z").toJSON(),
      fileName: "20160607173840-first_pending_migration.ts"
    }, awsConfig);
    clock.restore();
  });

  it("should yield a list of upgraded migration file names", async () => {
    const upgradedFileNames = await up();
    expect(upgradedFileNames).toEqual([
      "20160607173840-first_pending_migration.ts",
      "20160608060209-second_pending_migration.ts"
    ]);
  });

  it("should stop migrating when an error occurred and yield the error", async () => {
    secondPendingMigration.up.mockReturnValue(Promise.reject(new Error("Nope")));
    await expect(up()).rejects.toThrow("Could not migrate up 20160608060209-second_pending_migration.ts: Nope");
  });

  it("should yield an error + items already migrated when unable to update the migrationsLogDb", async () => {
    migrationsDbAddMigrationToMigrationsLogDb.mockReturnValueOnce(Promise.resolve()).mockReturnValueOnce(Promise.reject(new Error("Kernel panic")));
    await expect(up()).rejects.toThrow("Could not update migrationsLogDb: Kernel panic");
  })
})