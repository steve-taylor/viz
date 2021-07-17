import 'core-js/stable';
import 'regenerator-runtime';

import {runTest} from './toolkit';
import Viz from './viz';

const viz = new Viz();

/**
 * Create a test suite.
 *
 * @param suiteName      - test suite name
 * @param testCreator    - function that creates tests
 * @param suiteViewports - optional test viewports
 */
export function describe(suiteName, testCreator, suiteViewports) {
    viz.registerSuite({suiteName, testCreator, suiteViewports});
}

/**
 * Initialize each test within a suite.
 *
 * @param testInitializer - code to run before each test
 */
export function beforeEach(testInitializer) {
    viz.registerTestInitializer({testInitializer});
}

/**
 * Finalize each test within a suite.
 *
 * @param testFinalizer - code to run after each test
 */
export function afterEach(testFinalizer) {
    viz.registerTestFinalizer({testFinalizer});
}

/**
 * Create a test.
 *
 * @param testName      - name of the test
 * @param testRunner    - code to execute
 * @param testViewports - optional viewports
 */
export function test(testName, testRunner, testViewports) {
    viz.registerTestCase({testName, testRunner, testViewports});
}

/**
 * Alias for {@link test}.
 */
export function it(testName, testRunner, testViewports) {
    test(testName, testRunner, testViewports)
}

Object.assign(window, {
    viz: {
        // For debugging tests in the browser
        runTest,

        // API through which Node.js viz communicates with browser viz via puppeteer
        _registerTests: () => viz.registerAllTests(),
        _runTests: (props) => viz.runTests(props),
        _getSuites: () => viz.registeredSuites,
        _getTests: () => viz.registeredTests,
        _reset: () => viz.reset(),
    },
});
