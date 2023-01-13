import AWS from 'aws-sdk';
import AWSMock from 'aws-sdk-mock';
import { CreateTableInput,PutItemInput,DescribeTableInput, ScanInput, ItemList, DeleteItemInput } from 'aws-sdk/clients/dynamodb';
import sinon from 'sinon';

import * as migrationsDb from "../../../src/lib/env/migrationsDb";
import * as config from "../../../src/lib/env/config";

describe("migrationsDb",()=>{
    let configRead:jest.SpyInstance;
    beforeEach(()=>{
        configRead = jest.spyOn(config,"read").mockReturnValue(Promise.resolve([{
            region:'abc',
            accessKeyId:'abc',
            secretAccessKey:'abc'
        }]));        
    });

    afterEach(()=>{
        configRead.mockRestore();
    });

    describe("configureMigrationsLogDbSchema()",()=>{
        it("should resolve when no errors are thrown while creating migrationsLogDb", async()=>{
            AWSMock.mock('DynamoDB', 'createTable', (params: CreateTableInput, callback:(error:Error|null,responseObj:{ pk:string,sk:string })=>void) => {
                callback(null, { pk: 'foo', sk: 'bar' });
            })

            await expect(migrationsDb.configureMigrationsLogDbSchema()).resolves.not.toThrowError();
            AWSMock.restore('DynamoDB')
        })

        it("should reject when error is thrown while creating migrationsLogDb", async()=>{
            AWSMock.mock('DynamoDB', 'createTable', (params: CreateTableInput, callback: (error:Error|null,responseObj:{ pk:string,sk:string }|null)=>void) => {
                callback(new Error("Could not create"), null);
            })

            await expect(migrationsDb.configureMigrationsLogDbSchema()).rejects.toThrow("Could not create");
            AWSMock.restore('DynamoDB')
        })
    })

    describe("addMigrationToMigrationsLogDb()",()=>{
        it("should resolve when no errors are thrown while adding migration to migrationsLogDb", async()=>{
            AWSMock.mock('DynamoDB', 'putItem', (params: PutItemInput, callback: (error:Error|null,responseObj:{ pk:string,sk:string })=>void) => {
                callback(null, { pk: 'foo', sk: 'bar' });
            })


            await expect(migrationsDb.addMigrationToMigrationsLogDb({ fileName:"abc.ts",appliedAt:"20201014172343" })).resolves.not.toThrow();
            AWSMock.restore('DynamoDB')
        })

        it("should reject when error is thrown while adding migration to migrationsLogDb", async()=>{
            AWSMock.mock('DynamoDB', 'putItem', (params: PutItemInput, callback: (error:Error|null,responseObj:{ pk:string,sk:string }|null)=>void) => {
                callback(new Error("Resource Not Found"), null);
            })

            await expect(migrationsDb.addMigrationToMigrationsLogDb({ fileName:"abc.ts",appliedAt:"20201014172343" })).rejects.toThrow("Resource Not Found");
            AWSMock.restore('DynamoDB')
        })
    })

    describe("deleteMigrationFromMigrationsLogDb()",()=>{
        it("should resolve when no errors are thrown while deleting migration",async()=>{
            AWSMock.mock('DynamoDB', 'deleteItem', (params: DeleteItemInput, callback: (error:Error|null,responseObj:{ pk:string,sk:string })=>void) => {
                callback(null, { pk: 'foo', sk: 'bar' });
            })

            const item: { fileName: string; appliedAt: string } = {
                fileName:"123.ts",
                appliedAt:"123"
            };
            await expect(migrationsDb.deleteMigrationFromMigrationsLogDb(item)).resolves.not.toThrow();
            AWSMock.restore('DynamoDB');
        })

        it("should reject when error is thrown while deleting migration",async()=>{
            AWSMock.mock('DynamoDB', 'deleteItem', (params: DeleteItemInput, callback: (error:Error|null,responseObj:{ pk:string,sk:string }|null)=>void) => {
                callback(new Error("Could not delete migration"),null);
            });

            const item: { fileName: string; appliedAt: string } = {
                fileName:"123.ts",
                appliedAt:"123"
            };
            await expect(migrationsDb.deleteMigrationFromMigrationsLogDb(item)).rejects.toThrow("Could not delete migration");
            AWSMock.restore('DynamoDB');
        })
    })

    describe("doesMigrationsLogDbExists()",()=>{
        it("should resolve when no errors are thrown while describing migrationsLogDb", async()=>{
            AWSMock.mock('DynamoDB', 'describeTable', (params: DescribeTableInput, callback: (error:Error|null,responseObj:{ pk:string,sk:string })=>void) => {
                callback(null, { pk: 'foo', sk: 'bar' });
            })

            await expect(migrationsDb.doesMigrationsLogDbExists()).resolves.not.toThrow();
            AWSMock.restore('DynamoDB')
        })

        it("should reject when error is thrown while describing migrationsLogDb", async()=>{
            AWSMock.mock('DynamoDB', 'describeTable', (params: DescribeTableInput, callback: (error:Error|null,responseObj:{ pk:string,sk:string }|null)=>void) => {
                callback(new Error("Resource Not Found"), null);
            })

            await expect(migrationsDb.doesMigrationsLogDbExists()).rejects.toThrow("Resource Not Found");
            AWSMock.restore('DynamoDB')
        })
    })

    describe("getAllMigrations()",()=>{
        it("should return a migrations array",async()=>{
            const Items:ItemList = [{
                FILE_NAME:{ S:"abc.ts" },
                APPLIED_AT:{ S:"123" }
            },
            {
                FILE_NAME:{ S:"def.ts" },
                APPLIED_AT:{ S:"124" }
            }];

            AWSMock.mock('DynamoDB','scan',(params:ScanInput,callback:(error:Error|null,responseObj:{ Items: ItemList; })=>void)=>{
                callback(null,{ Items }); 
            });

            const migrations = await migrationsDb.getAllMigrations();
            expect(migrations).toStrictEqual([{ FILE_NAME:"abc.ts",APPLIED_AT:"123" },{ FILE_NAME:"def.ts",APPLIED_AT:"124" }]);
            AWSMock.restore('DynamoDB')
        });

        it("should make recursive calls and return the data of all recursive calls in single array",async()=>{
            const stub = sinon.stub();
            let Items:ItemList = [{
                FILE_NAME:{ S:"1.ts" },
                APPLIED_AT:{ S:"1" }
            },
            {
                FILE_NAME:{ S:"2.ts" },
                APPLIED_AT:{ S:"2" }
            }];

            const LastEvaluatedKey:AWS.DynamoDB.Key = {
                FILE_NAME:{ S:"2.ts" },
                APPLIED_AT:{ S:"2" }
            };

            
            stub.onCall(0).returns({ Items,LastEvaluatedKey });
            Items = [
                {
                    FILE_NAME:{ S:"3.ts" },
                    APPLIED_AT:{ S:"3" }
                }
            ]
            stub.onCall(1).returns({ Items });

            AWSMock.mock('DynamoDB','scan',(params:ScanInput,callback:(error:Error|null,stub:sinon.SinonStub)=>void)=>{
                callback(null,stub()); 
            });
            const migrations = await migrationsDb.getAllMigrations();
            expect(migrations).toStrictEqual([{ FILE_NAME:"1.ts",APPLIED_AT:"1" },{ FILE_NAME:"2.ts",APPLIED_AT:"2" },{ FILE_NAME:"3.ts",APPLIED_AT:"3" }]);
            AWSMock.restore('DynamoDB')
        })
    })

})