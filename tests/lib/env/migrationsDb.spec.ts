import AWSMock from 'aws-sdk-mock';
import { CreateTableInput,PutItemInput,DescribeTableInput } from 'aws-sdk/clients/dynamodb';

import * as migrationsDb from "../../../src/lib/env/migrationsDb";
import * as config from "../../../src/lib/env/config";

describe("migrationsDb",()=>{
    let configRead;
    beforeEach(()=>{
        configRead = jest.spyOn(config,"read").mockReturnValue(Promise.resolve({
            region:'abc',
            accessKeyId:'abc',
            secretAccessKey:'abc'
        }));        
    });

    describe("configureMigrationsLogDbSchema()",()=>{
        it("should resolve when no errors are thrown while creating migrationsLogDb", async()=>{
            AWSMock.mock('DynamoDB', 'createTable', (params: CreateTableInput, callback: any) => {
                callback(null, { pk: 'foo', sk: 'bar' });
            })

            await migrationsDb.configureMigrationsLogDbSchema();
            AWSMock.restore('DynamoDB')
        })

        it("should reject when error is thrown while creating migrationsLogDb", async()=>{
            AWSMock.mock('DynamoDB', 'createTable', (params: CreateTableInput, callback: any) => {
                callback(new Error("Could not create"), null);
            })

            await expect(migrationsDb.configureMigrationsLogDbSchema()).rejects.toThrow("Could not create");
            AWSMock.restore('DynamoDB')
        })
    })

    describe("addMigrationToMigrationsLogDb()",()=>{
        it("should resolve when no errors are thrown while adding migration to migrationsLogDb", async()=>{
            AWSMock.mock('DynamoDB', 'putItem', (params: PutItemInput, callback: any) => {
                callback(null, { pk: 'foo', sk: 'bar' });
            })


            await migrationsDb.addMigrationToMigrationsLogDb({ fileName:"abc.ts",appliedAt:"20201014172343" });
            AWSMock.restore('DynamoDB')
        })

        it("should reject when error is thrown while adding migration to migrationsLogDb", async()=>{
            AWSMock.mock('DynamoDB', 'putItem', (params: PutItemInput, callback: any) => {
                callback(new Error("Resource Not Found"), null);
            })

            await expect(migrationsDb.addMigrationToMigrationsLogDb({ fileName:"abc.ts",appliedAt:"20201014172343" })).rejects.toThrow("Resource Not Found");
            AWSMock.restore('DynamoDB')
        })
    })

    describe("doesMigrationsLogDbExists()",()=>{
        it("should resolve when no errors are thrown while describing migrationsLogDb", async()=>{
            AWSMock.mock('DynamoDB', 'describeTable', (params: DescribeTableInput, callback: any) => {
                callback(null, { pk: 'foo', sk: 'bar' });
            })

            await migrationsDb.doesMigrationsLogDbExists();
            AWSMock.restore('DynamoDB')
        })

        it("should reject when error is thrown while describing migrationsLogDb", async()=>{
            AWSMock.mock('DynamoDB', 'describeTable', (params: DescribeTableInput, callback: any) => {
                callback(new Error("Resource Not Found"), null);
            })

            await expect(migrationsDb.doesMigrationsLogDbExists()).rejects.toThrow("Resource Not Found");
            AWSMock.restore('DynamoDB')
        })
    })

})