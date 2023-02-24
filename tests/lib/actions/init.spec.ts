import path from "path";
import fs from "fs-extra";
import * as config from "../../../src/lib/env/config";
import { init } from "../../../src/lib/actions/init";

describe("init", () => {

  let configSpy: jest.SpyInstance;
  let fsMkdir: jest.SpyInstance;
  let fsWriteSync: jest.SpyInstance;

  beforeEach(() => {
    configSpy = jest.spyOn(config, "isConfigFilePresent");
    fsMkdir = jest.spyOn(fs, "mkdirs").mockImplementation(() => {});
    fsWriteSync = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
  })


  it("should not continue and throw an error if the config file already exists", async () => {
    configSpy.mockReturnValue(true);
    await expect(init()).rejects.toThrow("Config file already exist, init step not required");
  });

  it("should copy the sample config file to the current working directory", async () => {
    configSpy.mockReturnValue(false);
    await init();
    expect(fsWriteSync).toHaveBeenCalledTimes(1);
  });

  it("should yield errors that occurred when copying the sample config", async () => {
    configSpy.mockReturnValue(false);
    fsWriteSync.mockImplementation(() => { throw new Error("No space left on device"); });
    await expect(init()).rejects.toThrow("No space left on device");
  });

  it("should create a migrations directory in the current working directory", async () => {
    configSpy.mockReturnValue(false);
    await init();
    expect(fsMkdir).toHaveBeenCalledTimes(1);
    expect(fsMkdir).toHaveBeenCalledWith(path.join(process.cwd(), "/migrations"));
  });

  it("should yield errors that occurred when creating the migrations directory", async () => {
    configSpy.mockReturnValue(false);
    fsMkdir.mockImplementation(() => { throw new Error("Migrations directory could not be created"); });
    await expect(init()).rejects.toThrow("Migrations directory could not be created");
  });
});

