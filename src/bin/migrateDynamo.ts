#!/usr/bin/env node
import { program } from 'commander';
import { isEmpty } from 'lodash';
import packageJson from '../../package.json';
import { initAction, createAction } from '../lib/migrateDynamo';

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
    .action((description) => {
        createAction(description);
    });

program.version(packageJson.version);

program.parse(process.argv);

if (isEmpty(program.args)) {
    program.outputHelp();
}
