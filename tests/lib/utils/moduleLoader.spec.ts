import * as tsImport from 'ts-import';
import * as moduleLoader from "../../../src/lib/utils/moduleLoader";

describe("moduleLoader", () => {
    describe("importFile()", () => {
        it("should call tsImport.loadSync()", () => {
            jest.spyOn(tsImport, "loadSync").mockReturnValue({});
            moduleLoader.importFile('migrations/abc.ts');
            expect(tsImport.loadSync).toBeCalled();
        })
    })
})