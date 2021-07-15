const path = require('path');
const fsExtra = require('fs-extra');

const logger = require('./logger');

const DEFAULT_CONFIG = {
    chromeExecutablePath: null,
    concurrentLimit: 1,
    defaultViewportWidth: 1024,
    defaultViewportHeight: 1080,
    outputPath: path.join(process.cwd(), 'tmp'),
    testReportOutputDir: path.join(process.cwd(), 'tmp', 'report'),
    testFilePath: process.cwd(),
    testFilePattern: ['.viz.js', '.viz.ts'],
    testRunnerHtml: null,
    tmpDir: path.join(__dirname, '..', '..', '..', 'tmp'),
    threshold: 0,
    includeAA: false,
};

module.exports = async function getConfig() {
    let configJson;

    try {
        const possibleConfigPaths = [
            'viz.json',
            '.vizrc',
            '.viz.js',
            'viz.js',
        ].map((filename) => path.join(process.cwd(), filename));

        const foundConfigFiles = (
            await Promise.all(
                possibleConfigPaths.map(
                    async (possibleConfigPath) => {
                        try {
                            if (/\.js$/.test(possibleConfigPath)) {
                                // If the config is JavaScript, import and evaluate it.
                                const configModule = require(possibleConfigPath);

                                // If it's a function, execute it and use the result. Otherwise, use it as is.
                                return typeof configModule === 'function' ? configModule() : configModule;
                            }

                            // The config is JSON, so use it as is.
                            return await fsExtra.readJson(possibleConfigPath);
                        } catch (error) {
                            return null;
                        }
                    }
                )
            )
        )
            // Filter out all the empty/non existent/erroneous ones
            .filter(Boolean);

        if (foundConfigFiles.length > 1) {
            console.warn('Found more than one viz config file. Taking the first.');
        }

        configJson = foundConfigFiles[0] || {};
    } catch (error) {
        configJson = {};
    }

    const fullConfig = {
        ...DEFAULT_CONFIG,
        ...configJson,
    };

    logger.debug('Using config', fullConfig);

    return fullConfig;
};
