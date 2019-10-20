const path = require('path');
const fsExtra = require('fs-extra');

const getScreenshotPath = require('./screenshot-path');
const logger = require('./logger');

module.exports = async function ensureDirs({
    testsByViewport,
    config,
}) {
    logger.info('Preparing output directories for screenshots');

    await Promise.all(
        testsByViewport.map(
            ({viewportWidth, viewportHeight, tests}) => Promise.all(
                tests.map(
                    ({testName, suiteName}) => Promise.all(
                        [true, false]
                            .map((isTest) => getScreenshotPath({
                                config,
                                isTest,
                                suiteName,
                                testName,
                                viewportWidth,
                                viewportHeight,
                            }))
                            .map(path.dirname)
                            .map((dirPath) => fsExtra.ensureDir(dirPath))
                    )
                )
            )
        )
    );
};
