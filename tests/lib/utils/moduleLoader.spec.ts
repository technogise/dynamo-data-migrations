import * as tsImport from 'ts-import';
import * as moduleLoader from "../../../src/lib/utils/moduleLoader";

describe("moduleLoader", () => {
    describe("importFile()", () => {
        it("should call tsImport.load()", async () => {
            jest.spyOn(tsImport, "load").mockResolvedValue(Promise.resolve());
            await moduleLoader.importFile('migrations/abc.ts');
            expect(tsImport.load).toBeCalled();
        })
    })
})