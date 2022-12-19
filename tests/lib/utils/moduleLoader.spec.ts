import * as tsImport from 'ts-import';
import * as moduleLoader from "../../../src/lib/utils/moduleLoader";

describe("moduleLoader",()=>{
    let tsImportLoad: { mockRestore: () => void; };

    beforeEach(async()=>{
        tsImportLoad = jest.spyOn(tsImport,"load");
    });

    afterEach(async()=>{
        tsImportLoad.mockRestore();
    });

    describe("importFile()",()=>{

        it("should call tsImport.load()",async()=>{
            const fakeMigrationFileName = "migrations/abc.ts";
            const fakeReturnValue = {};
            const load = jest.spyOn(tsImport,"load").mockResolvedValue(fakeReturnValue);
            
            await moduleLoader.importFile(fakeMigrationFileName);
            expect(load).toBeCalled();
        })
    })
})