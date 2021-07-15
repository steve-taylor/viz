import 'core-js/stable';
import 'regenerator-runtime';

import Viz from './viz';
import {_setup, runTest} from './toolkit';

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
 * Alis for {@link test}.
 */
export function it(testName, testRunner, testViewports) {
    test(testName, testRunner, testViewports)
}

// Allow usage without importing viz (may be deprecated in a future major release).
Object.assign(window, {describe, beforeEach, afterEach, test, it})

window._registerTests = () => viz.registerAllTests();
window._runTests = (props) => viz.runTests(props);
window._getSuites = () => viz.registeredSuites;
window._getTests = () => viz.registeredTests;
window._reset = () => viz.reset;

// For debugging tests in the browser
window.viz = {_setup, runTest};
