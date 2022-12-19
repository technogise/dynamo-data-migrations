import path from "path";
import fs from "fs-extra";
import * as migrationsDir from "../../../src/lib/env/migrationsDir";
import * as config from "../../../src/lib/env/config";
import { init } from "../../../src/lib/actions/init";

describe("init",()=>{

  let migrationsDirShouldNotExist: { mockRestore: () => void; };
  let configShouldNotExist: { mockRestore: () => void; };
  let fsCopy: { mockRestore: () => void; };
  let fsMkdirs: { mockRestore: () => void; };


  beforeEach(async ()=>{
    migrationsDirShouldNotExist = jest.spyOn(migrationsDir,"shouldNotExist").mockReturnValue(Promise.resolve());
    configShouldNotExist = jest.spyOn(config,"shouldNotExist").mockReturnValue(Promise.resolve());
    fsCopy = jest.spyOn(fs,"copy").mockReturnValue();
    fsMkdirs = jest.spyOn(fs,"mkdirs").mockReturnValue();
  })

  afterEach(()=>{
    migrationsDirShouldNotExist.mockRestore();
    configShouldNotExist.mockRestore();
    fsCopy.mockRestore();
    fsMkdirs.mockRestore();
  })


  it("should check if the migrations directory already exists",async ()=>{
    const shouldNotExist = jest.spyOn(migrationsDir,"shouldNotExist").mockReturnValue(Promise.resolve());
    await init();
    expect(shouldNotExist).toHaveBeenCalled();
  });

  it("should not continue and yield an error if the migrations directory already exists", async () => {
    jest.spyOn(migrationsDir,"shouldNotExist").mockReturnValue(
      Promise.reject(new Error("Dir exists"))
    );
    const copy = jest.spyOn(fs,"copy").mockReturnValue();
    const mkdirs = jest.spyOn(fs,"mkdirs").mockReturnValue();

    await expect(init()).rejects.toThrow("Dir exists");
    expect(copy).toHaveBeenCalledTimes(0);
    expect(mkdirs).toHaveBeenCalledTimes(0);
  });

  it("should check if the config file already exists", async () => {
    const shouldNotExist = jest.spyOn(config,"shouldNotExist").mockReturnValue(Promise.resolve());
    await init();
    expect(shouldNotExist).toHaveBeenCalled();
  });

  it("should not continue and yield an error if the config file already exists", async () => {
    jest.spyOn(config,"shouldNotExist").mockReturnValue(
      Promise.reject(new Error("Config exists"))
    );
    const copy = jest.spyOn(fs,"copy").mockReturnValue();
    const mkdirs = jest.spyOn(fs,"mkdirs").mockReturnValue();

    await expect(init()).rejects.toThrow("Config exists");
    expect(copy).toHaveBeenCalledTimes(0);
    expect(mkdirs).toHaveBeenCalledTimes(0);
  });

  it("should copy the sample config file to the current working directory", async () => {
    const copy = jest.spyOn(fs,"copy").mockReturnValue();
    await init();
    expect(copy).toHaveBeenCalled();
    expect(copy).toHaveBeenCalledTimes(1);

    const source = "./node_modules/dynamo-data-migrations/src/samples/config.ts";
    const destination = path.join(process.cwd(), `setup.db/${config.DEFAULT_CONFIG_FILE_NAME}`);

    expect(copy).toHaveBeenCalledWith(source,destination);
  });

  it("should yield errors that occurred when copying the sample config", async () => {
    jest.spyOn(fs,"copy").mockImplementation(() => {
      throw new Error("No space left on device");
    });
    await expect(init()).rejects.toThrow("No space left on device");
  });

  it("should create a migrations directory in the current working directory", async () => {
    const mkdirs = jest.spyOn(fs,"mkdirs").mockReturnValue();
    await init();

    expect(mkdirs).toHaveBeenCalled();
    expect(mkdirs).toHaveBeenCalledTimes(1);
    expect(mkdirs).toHaveBeenCalledWith(path.join(process.cwd(), "setup.db/migrations"));
  });

  it("should yield errors that occurred when creating the migrations directory", async () => {
    jest.spyOn(fs,"mkdirs").mockImplementation(() => {
      throw new Error("Migrations directory could not be created");
    });
    
    await expect(init()).rejects.toThrow("Migrations directory could not be created");
  });
});

