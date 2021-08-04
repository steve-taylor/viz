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
    outputPath: '.viz/out',
    testReportOutputDir: '.viz/out/report',
    testFilePath: '.',
    testFilePattern: ['.viz.js', '.viz.jsx', '.viz.tsx'],
    testRunnerHtml: null,
    tmpDir: '.viz/tmp',
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

module.exports = async function getConfig(packageDir) {
    // If packageDir specified, ensure packageDir/package.json exists
    if (
        packageDir &&
        !(await fsExtra.pathExists(path.resolve(process.cwd(), packageDir, 'package.json')))
    ) {
        console.error(`"${packageDir}" isn't a package directory.`)
        process.exit(1)
    }

    let configJson;

    try {
        // For now, only consider viz configs in the current directory.
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

    // Apply packageDir if specified.
    if (packageDir) {
        fullConfig.testFilePath = path.resolve(process.cwd(), packageDir)
        fullConfig.outputPath = path.join(packageDir, fullConfig.outputPath)
        fullConfig.testReportOutputDir = path.join(packageDir, fullConfig.testReportOutputDir)
        fullConfig.tmpDir = path.join(packageDir, fullConfig.tmpDir)
    }

    // Ensure config paths are absolute
    ['testFilePath', 'outputPath', 'testReportOutputDir', 'tmpDir'].forEach(configProperty => {
        if (!fullConfig[configProperty].startsWith(process.cwd())) {
            fullConfig[configProperty] = path.resolve(process.cwd(), fullConfig[configProperty])
        }
    })

    logger.debug('Using config', fullConfig);

    return fullConfig;
};
