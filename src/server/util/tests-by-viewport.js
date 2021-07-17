const fsExtra = require('fs-extra');
const isEqual = require('lodash/isEqual');
const property = require('lodash/property');
const uniqWith = require('lodash/uniqWith');

const logger = require('./logger');
const getScreenshotPath = require('./screenshot-path');

/*
 * Returns an array of objects of the form
 * {
 *     viewportWidth,
 *     viewportHeight,
 *     tests: [{testName, suiteName, viewports}]
 * }
 */
module.exports = async function getTestsByViewport({
    pages,
    shouldReplaceMissingOnly = false,
    specificSuiteNames = null,
    isTest,
    config,
}) {
    logger.info('Discovering tests and viewports');

    const {
        defaultViewportHeight,
        defaultViewportWidth,
    } = config;

    const defaultViewports = [[defaultViewportWidth, defaultViewportHeight]];

    // Register the tests for all the pages we have
    await Promise.all(pages.map((page) => page.evaluate(() => window.viz._registerTests())));

    // The tests are the same across all the pages so we only bother checking page 1 for this
    const [firstPage] = pages;
    const suites = await firstPage.evaluate(() => window.viz._getSuites());
    const tests = await firstPage.evaluate(() => window.viz._getTests());

    const suiteViewports = suites.reduce((curr, {suiteName, suiteViewports}) => ({
        ...curr,
        [suiteName]: suiteViewports,
    }), {});

    const allTestsWithViewports = tests.reduce((curr, {testName, suiteName, testViewports}) => [
        ...curr,
        {
            testName,
            suiteName,
            viewports: [testViewports, suiteViewports[suiteName]].find(property('length')) || defaultViewports,
        },
    ], []);

    const testsToRun = allTestsWithViewports
        .filter(({testName, suiteName, viewports}) => {
            if (isTest) {
                return true;
            }

            if (shouldReplaceMissingOnly) {
                return viewports.map(([viewportWidth, viewportHeight]) => !fsExtra.pathExistsSync(
                    getScreenshotPath({config, isTest, suiteName, testName, viewportWidth, viewportHeight})
                ));
            }

            return specificSuiteNames === null || specificSuiteNames.includes(suiteName);
        })
        .map((test, testNumber) => ({...test, testNumber}));

    const allViewports = uniqWith(
        testsToRun.reduce((acc, {viewports}) => [...acc, ...viewports], []),
        isEqual
    );

    logger.info(`Found ${testsToRun.length} tests to run`);

    // Tests grouped by viewport
    return allViewports.map(([viewportWidth, viewportHeight]) => ({
        viewportWidth,
        viewportHeight,
        tests: testsToRun.filter(({viewports}) => (
            viewports.some(([width, height]) => width === viewportWidth && height === viewportHeight)
        )),
    }));
};
