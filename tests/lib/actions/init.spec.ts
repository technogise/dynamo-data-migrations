import path from "path";
import fs from "fs-extra";
import * as migrationsDir from "../../../src/lib/env/migrationsDir";
import * as config from "../../../src/lib/env/config";
import { init } from "../../../src/lib/actions/init";

describe("init", () => {

  let migrationDirSpy: jest.SpyInstance;
  let configSpy: jest.SpyInstance;
  let fsCopy: jest.SpyInstance;
  let fsMkdirs: jest.SpyInstance;


  beforeEach( () => {
    migrationDirSpy = jest.spyOn(migrationsDir, "isMigrationDirPresent");
    configSpy = jest.spyOn(config, "isConfigFilePresent");
    fsCopy = jest.spyOn(fs, "copySync").mockImplementation(() => {});
    fsMkdirs = jest.spyOn(fs, "mkdirs").mockImplementation(() => {});
  })



  it("should check if the migrations directory and  config already exists", async () => {
    await init();
    expect(migrationDirSpy).toHaveBeenCalled();
    expect(configSpy).toHaveBeenCalled();
  });

  it("should not continue and throw an error if the migrations directory already exists", async () => {
    migrationDirSpy.mockReturnValue(true);
    await expect(init()).rejects.toThrow("Migrations Dir already exist. Init step not required");
    expect(fsCopy).toHaveBeenCalledTimes(0);
    expect(fsMkdirs).toHaveBeenCalledTimes(0);
  });


  it("should not continue and throw an error if the config file already exists", async () => {
    configSpy.mockReturnValue(true);
    await expect(init()).rejects.toThrow("Migrations Dir already exist. Init step not required");
    expect(fsCopy).toHaveBeenCalledTimes(0);
    expect(fsMkdirs).toHaveBeenCalledTimes(0);
  });

  it("should copy the sample config file to the current working directory", async () => {
    const source = "./node_modules/dynamo-data-migrations/src/samples/config.ts";
    const destination = path.join(process.cwd(), `setup.db/${config.DEFAULT_CONFIG_FILE_NAME}`);
    configSpy.mockReturnValue(false);
    migrationDirSpy.mockReturnValue(false);
    await init();
    expect(fsCopy).toHaveBeenCalledTimes(1);
    expect(fsCopy).toHaveBeenCalledWith(source, destination);
  });

  it("should yield errors that occurred when copying the sample config", async () => {
    configSpy.mockReturnValue(false);
    migrationDirSpy.mockReturnValue(false);
    fsCopy.mockImplementation(() => { throw new Error("No space left on device"); });
    await expect(init()).rejects.toThrow("No space left on device");
  });

  it("should create a migrations directory in the current working directory", async () => {
    configSpy.mockReturnValue(false);
    migrationDirSpy.mockReturnValue(false);
    await init();
    expect(fsMkdirs).toHaveBeenCalledTimes(1);
    expect(fsMkdirs).toHaveBeenCalledWith(path.join(process.cwd(), "setup.db/migrations"));
  });

  it("should yield errors that occurred when creating the migrations directory", async () => {
    configSpy.mockReturnValue(false);
    migrationDirSpy.mockReturnValue(false);
    fsMkdirs.mockImplementation(() => { throw new Error("Migrations directory could not be created"); });
    await expect(init()).rejects.toThrow("Migrations directory could not be created");
  });
});

