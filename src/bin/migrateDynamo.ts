#!/usr/bin/env node
import { program } from 'commander';
import Table from 'cli-table3';
import _, { isEmpty } from 'lodash';
import packageJson from '../../package.json';
import { initAction, createAction, upAction, statusAction, downAction } from '../lib/migrateDynamo';

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
    .option('--profile <type>', 'AWS credentials and configuration to be used', 'default')
    .description('create a new database migration with the provided description')
    .action(async (description, option) => {
        try {
            const message = await createAction(description, option.profile);
            console.info(message);
        } catch (error) {
            console.error(error);
        }
    });

program
    .command('up')
    .option('--profile <type>', 'AWS credentials and configuration to be used', 'default')
    .description('run all pending database migrations against a provided profile.')
    .action(async (option) => {
        try {
            const migrated = await upAction(option.profile);
            printMigrated(migrated);
        } catch (error) {
            console.error(error);
            const e = error as ERROR;
            printMigrated(e.migrated);
        }
    });

program
    .command('down')
    .option('--profile <type>', 'AWS credentials and configuration to be used', 'default')
    .description('undo the last applied database migration against a provided profile.')
    .action(async (option) => {
        try {
            const migrated = await downAction(option.profile);
            const migratedItemsInfo: string = migrated.map((item) => `MIGRATED DOWN: ${item}`).join('\n');
            console.info(migratedItemsInfo);
        } catch (error) {
            console.error(error);
        }
    });

program
    .command('status')
    .option('--profile <type>', 'AWS credentials and configuration to be used', 'default')
    .description('print the changelog of the database against a provided profile')
    .action(async (option) => {
        try {
            const statusItems = await statusAction(option.profile);
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
