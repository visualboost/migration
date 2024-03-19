#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

const _ = require("lodash");
const {up, down, backup} = require("../src");
const {createMigrationFile, runUp} = require("../src/util");
const TARGETS = require("../src/constants/TARGETS");

program.command('create')
    .description("Create a new migration file")
    .argument('<target>', 'The target to create a migration file for (AUTH, MAIN, BUILD)')
    .argument('<version>', 'A version number (e.g. 0.0.1)')
    .action((target, version) => {
        if(Object.keys(TARGETS).includes(target) === false){
            console.error("Invalid target");
            process.exit(1);
        }
        
        const targetValue = TARGETS[target];
        createMigrationFile(targetValue, version);

        console.log("New migration file create");
    });

program.command('up')
    .description("Run up migrations")
    .argument('<target>', 'The target to run the migration (AUTH, MAIN, BUILD)')
    .action(async (target) => {
        if(Object.keys(TARGETS).includes(target) === false){
            console.error("Invalid target");
            process.exit(1);
        }

        await up(target);
        console.log("Finished migration for Target: " + target);
    });

program.command('down')
    .description("Run rollback")
    .argument('<target>', 'The target to run the rollbacks (AUTH, MAIN, BUILD)')
    .action(async (target) => {
        if(Object.keys(TARGETS).includes(target) === false){
            console.error("Invalid target");
            process.exit(1);
        }

        await down(target);
        console.log("Finished rollback for Target: " + target);
    });


program.command('backup')
    .description("Creates a database backup")
    .argument('<target>', 'The target (AUTH, MAIN, BUILD)')
    .argument('<version>', 'The current application version (e.g. 1.0.0)')
    .action(async (target, version) => {
        if(Object.keys(TARGETS).includes(target) === false){
            console.error("Invalid target");
            process.exit(1);
        }

        await backup(target, version);
        console.log("Finished backup for Target: " + target);
    });


program.parse();

if (_.isEmpty(program.rawArgs)) {
    program.outputHelp();
}