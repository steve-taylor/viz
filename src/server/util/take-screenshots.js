const chunk = require('lodash/chunk');
const times = require('lodash/times');

const getScreenshotPath = require('./screenshot-path');
const logger = require('./logger');

// Refresh the pages at most every 20 tests to avoid puppeteer hanging
const PAGE_REFRESH_FREQUENCY = 20;
const SLOW_TEST_WARNING_TIME_MS = 7 * 1000 * PAGE_REFRESH_FREQUENCY;
const NUM_TEST_RETRIES = 2;

module.exports = async function takeScreenshots({
    config,
    testsByViewport,
    isTest,
    pages,
}) {
    logger.info('Taking screenshots');

    const {concurrentLimit} = config;

    await Promise.all(times(concurrentLimit, (threadNumber) => runTestsForThread({
        config,
        threadNumber,
        page: pages[threadNumber],
        testsByViewport: testsByViewport.map(({tests, ...rest}) => ({
            ...rest,
            tests: tests.filter(({testNumber}) => testNumber % concurrentLimit === threadNumber), // Filter out tests not in this thread
        })),
        isTest,
    })));
};

async function runTestsForThread({
    config,
    threadNumber,
    page,
    testsByViewport,
    isTest,
}) {
    for (const {tests, viewportWidth, viewportHeight} of testsByViewport) {
        if (!tests.length) {
            // No tests for the current viewport in this thread.
            continue;
        }

        logger.info(`Thread ${threadNumber} running ${tests.length} test(s) at viewport ${viewportWidth}x${viewportHeight}`);

        // set viewport on page
        await page.setViewport({
            width: viewportWidth,
            height: viewportHeight,
        });

        const testsForWindow = tests.map(({testName, suiteName, ...rest}) => ({
            testName,
            suiteName,
            ...rest,
            screenshotOutputPath: getScreenshotPath({
                config,
                isTest,
                suiteName,
                testName,
                viewportWidth,
                viewportHeight,
            }),
        }));

        // We reload the page every few tests (defined by PAGE_REFRESH_FREQUENCY), because sometimes Puppeteer hangs, and reloading mitigates that
        for (const tests of chunk(testsForWindow, PAGE_REFRESH_FREQUENCY)) {
            for (let retryCount = 0; retryCount <= NUM_TEST_RETRIES; ++retryCount) {
                let hungPageTimeout = null;

                try {
                    await Promise.race([
                        (async () => {
                            await page.evaluate((tests) => window._runTests({tests}), tests);
                            clearTimeout(hungPageTimeout);
                        })(),

                        // Fail on timeout
                        new Promise((resolve, reject) => {
                            hungPageTimeout = setTimeout(
                                () => {
                                    logger.warn(
                                        [
                                            `Thread ${threadNumber} at viewport ${viewportWidth}x${viewportHeight} has been running for more than ${Math.floor(SLOW_TEST_WARNING_TIME_MS / 1000)}s.`,
                                            retryCount < NUM_TEST_RETRIES && 'Retrying.'
                                        ]
                                            .filter(Boolean) // Filter out 'Retrying' if we're not retrying anymore
                                            .join(' ')
                                    );
                                    reject();
                                },
                                SLOW_TEST_WARNING_TIME_MS
                            );
                        }),
                    ]);

                    // Success! Break out of the retry loop.
                    break;
                } catch (error) {
                    // Reload the page and re-register tests
                    await page.reload();
                    await page.evaluate(() => window._registerTests());

                    // If there are no more retries left, log and throw an error
                    if (retryCount === NUM_TEST_RETRIES) {
                        logger.error(`Tried running screenshot test ${NUM_TEST_RETRIES + 1} times with no success`, tests);
                        throw new Error(`Screenshot set failed ${NUM_TEST_RETRIES + 1} times`);
                    }
                }
            }
        }
    }

    logger.info('Screenshots complete');
}
