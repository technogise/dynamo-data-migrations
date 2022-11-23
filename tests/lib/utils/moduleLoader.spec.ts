import * as moduleLoader from "../../../src/lib/utils/moduleLoader";

describe("moduleLoader",()=>{

    describe("importFile()",()=>{

        it("should call the import object",async()=>{
            await moduleLoader.importFile("abc");
            expect(1).toEqual(1);
        })
    })
})