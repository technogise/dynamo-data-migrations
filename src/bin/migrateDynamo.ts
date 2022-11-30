#!/usr/bin/env node
import { program } from 'commander';
import { isEmpty } from 'lodash';
import packageJson from '../../package.json';
import { initAction, createAction, upAction } from '../lib/migrateDynamo';

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
            await upAction();
        } catch (error) {
            console.error(error);
        }
    });

program.version(packageJson.version);

program.parse(process.argv);

if (isEmpty(program.args)) {
    program.outputHelp();
}
