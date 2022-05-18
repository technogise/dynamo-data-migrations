#!/usr/bin/env node
import { program } from 'commander';
import { isEmpty } from 'lodash';
import packageJson from '../../package.json';
import { initAction, createAction } from '../lib/migrateDynamo';

program
    .command('init')
    .description('initialize a new migration project')
    .action(() => {
        initAction();
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
