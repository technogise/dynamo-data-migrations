import path from "path";
import fs from "fs-extra";
import { Stats } from "fs";
import * as moduleLoader from "../../../src/lib/utils/moduleLoader";
import * as config from "../../../src/lib/env/config";

type ERROR = { errno: number; syscall: string; code: string; path: string };

describe("config", ()=>{
    let moduleLoaderImportFile: { mockRestore: () => void; };
    let fsStat: { mockRestore: () => void; };

    beforeEach(async()=>{
        moduleLoaderImportFile = jest.spyOn(moduleLoader,"importFile");
        fsStat = jest.spyOn(fs,"stat");
    })

    afterEach(() =>{ 
        fsStat.mockRestore();
        moduleLoaderImportFile.mockRestore();
    })

    describe("shouldNotExist()",()=>{
        it("should not yield an error if the config does not exist", async () => {
            const errorMock:ERROR = {
                errno: 123,
                syscall: "sys",
                code: "ENOENT",
                path: "abc"
            }
            jest.spyOn(fs,"stat").mockRejectedValue(errorMock);
            
            await config.shouldNotExist();
        });

        it("should yield an error if the config exists", async () => {
            const configPath = path.join(process.cwd(), "setup.db/config.ts");
            const stats = new Stats();
            jest.spyOn(fs,"stat").mockResolvedValue(stats);
            await expect(config.shouldNotExist()).rejects.toThrow(`config file already exists: ${configPath}`)
        });

    })

    describe("read()",()=>{
        it("should attempt to read the config file", async () => {
            const configPath = path.join(process.cwd(), "setup.db/config.js");
            jest.spyOn(moduleLoader,"importFile").mockImplementation(()=>{
                throw new Error(`Cannot find module '${configPath}'`);
            });
            await expect(config.read()).rejects.toThrow(`Cannot find module '${configPath}'`)
        });
    })

})


