#!/usr/bin/env node
import { program } from 'commander';
import { isEmpty } from 'lodash';
import packageJson from '../../package.json';
import { initAction } from '../lib/migrateDynamo';

program
    .command('init')
    .description('initialize a new migration project')
    .action(() => {
        initAction();
    });

program.version(packageJson.version);

program.parse(process.argv);

if (isEmpty(program.rawArgs)) {
    program.outputHelp();
}
