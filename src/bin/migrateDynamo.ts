#!/usr/bin/env node
import { program } from 'commander';
import Table from 'cli-table3';
import _, { isEmpty } from 'lodash';
import packageJson from '../../package.json';
import { initAction, createAction, upAction, statusAction } from '../lib/migrateDynamo';

class ERROR extends Error {
    migrated?: string[];
}

function printMigrated(migrated: string[] = []) {
    const migratedItemsInfo: string = migrated.map((item) => `MIGRATED UP: ${item}`).join('\n');
    console.info(migratedItemsInfo);
}

function printStatusTable(statusItems: { fileName: string; appliedAt: string }[]) {
    const table = new Table({ head: ['Filename', 'Applied At'] });
    table.push(
        ...statusItems.map((item) => {
            return _.values(item);
        }),
    );
    console.info(table.toString());
}

program
    .command('init')
    .description('initialize a new migration project')
    .action(async () => {
        try {
            await initAction();
            console.info('Initialization successful. Please edit the generated config.ts file');
        } catch (error) {
            console.error(error);
        }
    });

program
    .command('create [description]')
    .description('create a new database migration with the provided description')
    .action(async (description) => {
        try {
            const message = await createAction(description);
            console.info(message);
        } catch (error) {
            console.error(error);
        }
    });

program
    .command('up')
    .description('run all pending database migrations')
    .action(async () => {
        try {
            const migrated = await upAction();
            printMigrated(migrated);
        } catch (error) {
            console.error(error);
            const e = error as ERROR;
            printMigrated(e.migrated);
        }
    });

program
    .command('status')
    .description('print the changelog of the database')
    .action(async () => {
        try {
            const statusItems = await statusAction();
            printStatusTable(statusItems);
        } catch (error) {
            console.error(error);
        }
    });

program.version(packageJson.version);

program.parse(process.argv);

if (isEmpty(program.args)) {
    program.outputHelp();
}
