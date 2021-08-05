#!/usr/bin/env node

const identity = require('lodash/identity')
const noop = require('lodash/noop')
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')

const getConfig = require('./util/config')
const takeBaselineScreenshots = require('./scripts/take-baseline-screenshots')
const test = require('./scripts/test')
const compileTests = require('./util/compile-tests')
const logger = require('./util/logger')

const skipCompileOption = [
    'skip-compile',
    {
        describe: 'Don’t compile tests. (Assumes they’ve been compiled.)',
        type: 'boolean',
    }
]

yargs(hideBin(process.argv))
    .command(
        'compile [packageDir]',
        'Compile tests',
        identity,
        async argv => {
            applyLogLevel(argv)
            await compileTests(await getConfig(argv.packageDir))
        })
    .command(
        'baseline [packageDir]',
        'Generate baseline screenshots',
        command => command
            .option('missing', {
                describe: 'Only take baseline screenshots that don’t yet exist.',
                type: 'boolean',
            })
            .option('suite', {
                describe: 'Only run specified suites.',
                type: 'array',
            })
            .option(...skipCompileOption),
        async argv => {
            applyLogLevel(argv)
            await takeBaselineScreenshots({
                config: await getConfig(argv.packageDir),
                shouldReplaceMissingOnly: !!argv.missing,
                skipCompile: !!argv.skipCompile,
                specificSuiteNames: argv.suite ?? null,
            })
        })
    .command(
        'test [packageDir]',
        'Run tests',
        command => command.option(...skipCompileOption),
        async argv => {
            applyLogLevel(argv)

            const success = await test({
                config: await getConfig(argv.packageDir),
                skipCompile: !!argv.skipCompile,
            })

            if (!success) {
                yargs.exit(1)
            }
        })
    .positional('packageDir', {
        describe: 'Path to the package containing tests',
        type: 'string'
    })
    .option('verbose', {
        describe: 'Show verbose logging',
        type: 'boolean',
    })
    .option('silent', {
        describe: 'Suppress logging',
        type: 'boolean',
    })
    .argv
    .then(noop)
    .catch(error => {
        console.error(error)
        logger.fatal('Error while running Viz', error)

        process.exit(1)
    })

function applyLogLevel(argv) {
    if (argv.verbose) {
        logger.level = 'debug'
    } else if (argv.silent) {
        logger.level = 'error'
    } else {
        logger.level = 'info'
    }
}
