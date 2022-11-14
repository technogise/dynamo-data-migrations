import { expect } from "chai";
import sinon from "sinon";
import path from "path";
import proxyquire from "proxyquire";
// import { copySampleConfigFile } from "../../../src/lib/actions/init";

function mockFs(){
    return {
        copySync:sinon.stub().returns(Promise.resolve()),
        mkdir: sinon.stub().returns(Promise.resolve())
    };
}

describe("init",()=>{
    let fs: { copySync: any; mkdir: any; };

    

    beforeEach(()=>{
        fs = mockFs();
        // copySampleConfigFile = proxyquire("../../../src/lib/actions/init.ts",{
        //     "fs-extra":fs
        // });

    });

    /* it("should copy the sample config file to the setup.db", ()=>{
        copySampleConfigFile();
        // expect(fs.copySync.called).to.equal(true);
        // expect(fs.copySync.callCount).to.equal(1);

        // const source = path.join(__dirname,fs.copySync.getCall(0).args[0]);
        // expect(source).to.equal(
        //     path.join(__dirname, "./node_modules/dynamo-data-migrations/src/samples/config.ts")
        // );

        const destination = fs.copySync.getCall(0).args[1];
        // expect(destination).to.equal("./setup.db/config.ts");
    });

    // it("should yield errors that occurred when creating the migrations directory", () => {
    //     fs.mkdir.returns(Promise.reject(new Error("I cannot do that")));
    //     try {
    //       init();
    //     } catch (err:any) {
    //       expect(err.message).to.equal("I cannot do that");
    //     }
    // });
    */
})

