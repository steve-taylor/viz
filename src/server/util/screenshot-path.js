const path = require('path');

const viewportToString = require('./viewport-to-string');

module.exports = function getScreenshotPath({
    config,
    isTest,
    isDiff,
    suiteName,
    testName,
    viewportWidth,
    viewportHeight,
}) {
    return path.join(
        config.outputPath,
        isDiff ? 'diff' : isTest ? 'tested' : 'baseline',
        suiteName,
        testName,
        `${viewportToString(config, {viewportWidth, viewportHeight})}.png`
    );
};
