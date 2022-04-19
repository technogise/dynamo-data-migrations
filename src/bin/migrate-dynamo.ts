#!/usr/bin/env node
const program = require('commander');
const pkgjson = require('../../package.json');
const _ = require('lodash');
const migr = require('../lib/migrate-dynamo');

program
    .command('init')
    .description('initialize a new migration project')
    .action(() => {
        console.log('init');
        migr.initAction();
    });

program.version(pkgjson.version);

program.parse(process.argv);

if (_.isEmpty(program.rawArgs)) {
    program.outputHelp();
}
