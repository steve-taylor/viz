const path = require('path');
const fsExtra = require('fs-extra');
const recursive = require('recursive-readdir');
const webpack = require('webpack');

const logger = require('./logger');

const BUNDLE_NAME = 'viz-tests';

const EXTENSIONS = [
    '.js',
    '.jsx',
    '.mjs',
    '.json',
    '.ts',
    '.tsx',
]

module.exports = async function compileTests({
    testFilePath,
    testFilePattern,
    tmpDir,
    testRunnerHtml,
    babel,
    sourceMaps,
}) {
    logger.info('Compiling tests...');

    const testFilePaths = await recursive(testFilePath, [
        (file, stats) => !(stats.isDirectory() || filenameMatchesPattern(file, testFilePattern)),
    ]);
    const bundleOutfilePath = path.join(tmpDir, `${BUNDLE_NAME}.js`);

    await fsExtra.ensureDir(tmpDir);

    logger.debug(`Building test script at ${bundleOutfilePath}`);
    logger.debug('Found test files at:', testFilePaths);

    await new Promise((resolve, reject) => {
        const extensions = [
            ...EXTENSIONS,
            ...(Array.isArray(testFilePattern) ? testFilePattern : [testFilePattern])
        ]

        webpack({
            mode: 'development',
            entry: testFilePaths,
            output: {
                path: path.dirname(bundleOutfilePath),
                filename: path.basename(bundleOutfilePath)
            },
            resolve: {
                extensions: [...extensions, '.mjs'],
            },
            module: {
                rules: [
                    {
                        test: /\.(ts|tsx|js|jsx|mjs|json)$/,
                        type: 'javascript/auto',
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: babel,
                        }
                    }
                ]
            },
            devtool: sourceMaps ? 'eval-source-map' : undefined,
        }, (err, stats) => {
            if (err) {
                reject(err)
            } else if (stats.hasErrors()) {
                logger.error(stats.toString({colors: true}));
                reject('stats error');
            } else {
                resolve();
            }
        });
    });

    // Copy the test runner to tmpDir
    await fsExtra.copy(
        testRunnerHtml ?? path.resolve(__dirname, '..', '..', 'runner.html'),
        path.resolve(tmpDir, 'runner.html')
    )

    logger.info('Compilation complete');
};

function filenameMatchesPattern(filename, testFilePattern) {
    return Array.isArray(testFilePattern)
        ? testFilePattern.some(pattern => filename.endsWith(pattern))
        : filename.endsWith(testFilePattern)
}
