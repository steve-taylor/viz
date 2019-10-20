import 'core-js/stable';
import 'regenerator-runtime';

import Viz from './viz';
import {_setup, runTest} from './toolkit';

const viz = new Viz();

// describe('my-awesome-component', () => {...});
window.describe = function (suiteName, testCreator, suiteViewports) {
    viz.registerSuite({suiteName, testCreator, suiteViewports});
};

// beforeEach(async () => {...});
window.beforeEach = function (testInitializer) {
    viz.registerTestInitializer({testInitializer});
};

// afterEach(async (target) => {...});
window.afterEach = function (testFinalizer) {
    viz.registerTestFinalizer({testFinalizer});
};

// test('my-test-case', async (target) => {...});
window.test = function (testName, testRunner, testViewports) {
    viz.registerTestCase({testName, testRunner, testViewports});
};

// Alias it to test
window.it = window.test;

window._registerTests = () => viz.registerAllTests();
window._runTests = (props) => viz.runTests(props);
window._getSuites = () => viz.registeredSuites;
window._getTests = () => viz.registeredTests;
window._reset = () => viz.reset;

// For debugging tests in the browser
window.viz = {_setup, runTest};
