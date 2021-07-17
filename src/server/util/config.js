const path = require('path');
const fsExtra = require('fs-extra');
const os = require('os');

const logger = require('./logger');

const chromePaths = {
    linux: '/usr/bin/chromium-browser',
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    win32: `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`
}

const DEFAULT_CONFIG = {
    chromeExecutablePath: chromePaths[os.platform()] ?? null,
    concurrentLimit: 1,
    defaultViewportWidth: 1024,
    defaultViewportHeight: 1080,
    viewportScale: 1,
    outputPath: path.resolve(process.cwd(), '.viz', 'out'),
    testReportOutputDir: path.resolve(process.cwd(), '.viz', 'out', 'report'),
    testFilePath: process.cwd(),
    testFilePattern: ['.viz.js', '.viz.jsx', '.viz.tsx'],
    testRunnerHtml: null,
    tmpDir: path.resolve(process.cwd(), '.viz', 'tmp'),
    threshold: 0,
    includeAA: false,
    babel: {
        presets: [
            '@babel/preset-env',
            '@babel/preset-typescript',
        ],
    },
    sourceMaps: false,
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
