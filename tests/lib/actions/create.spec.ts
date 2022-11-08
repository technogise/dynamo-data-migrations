import { expect } from "chai";
import sinon from "sinon";
import path from "path";
import proxyquire from "proxyquire";

function mockFs(){
    return{
        statSync:sinon.stub().returns(Promise.resolve()),
        existsSync:sinon.stub().returns(Promise.resolve()),
        mkdirSync:sinon.stub().returns(Promise.resolve()),
        copyFileSync:sinon.stub().returns(Promise.resolve())
    };
}

describe("create", ()=>{
    let create: (arg0: string) => any;
    let fs: { copyFileSync: any; statSync: any; existsSync: any; mkdirSync: any; };

    

    beforeEach(()=>{
        fs = mockFs();
        create = proxyquire("../../../src/lib/actions/create.ts",{
            "fs-extra":fs
        });
    });

    it("should create a new migration file and yield the filename",async()=>{
        const clock = sinon.useFakeTimers(
            new Date("2016-06-09T08:07:00.077Z").getTime()
          );
          const filename = create("my_description");
        //   expect(fs.statSync.called).to.equal(true);
        //   expect(fs.copyFileSync.getCall(0).args[0]).to.equal(
        //     path.join(__dirname, "../../samples/commonjs/migration.js")
        //   );
        //   expect(fs.copyFileSync.getCall(0).args[1]).to.equal(
        //     path.join(process.cwd(), "migrations", "20160609080700-my_description.js")
        //   );
        //   expect(filename).to.equal("20160609080700-my_description.js");
        //   clock.restore();
    })
});