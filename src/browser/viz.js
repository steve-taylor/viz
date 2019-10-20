import noop from 'lodash/noop';

export default class Viz {
    constructor() {
        this.registeredSuites = [];
        this.registeredTestInitializers = {};
        this.registeredTestFinalizers = {};
        this.registeredTests = [];
        this.currentSuiteName = null;
    }

    registerSuite({suiteName, testCreator, suiteViewports}) {
        if (this.currentSuiteName) {
            throw new Error('describe cannot be nested');
        }

        this.registeredSuites.push({suiteName, testCreator, suiteViewports});
    }

    registerAllTests() {
        this.registeredSuites.forEach(({testCreator, suiteName}) => {
            // Attach the current suite name to the class so when we call `tests` we can work out which test we're under
            this.currentSuiteName = suiteName;

            // Calls the function which will do a bunch of `test('foo', function () {...});
            testCreator();
        });
    }

    registerTestInitializer({testInitializer = noop}) {
        if (!this.currentSuiteName) {
            throw new Error('beforeEach must be called inside a describe callback');
        }

        this.registeredTestInitializers[this.currentSuiteName] = testInitializer;
    }

    registerTestFinalizer({testFinalizer = noop}) {
        if (!this.currentSuiteName) {
            throw new Error('afterEach must be called inside a describe callback');
        }

        this.registeredTestFinalizers[this.currentSuiteName] = testFinalizer;
    }

    registerTestCase({testName, testRunner, testViewports}) {
        if (!this.currentSuiteName) {
            throw new Error('test/it must be called inside a describe callback');
        }

        this.registeredTests.push({testName, testRunner, suiteName: this.currentSuiteName, testViewports});
    }

    // Customise those props to run, for example, every 10th tests starting at test 5
    // This helps if you want to run tests in parallel
    async runTests({tests} = {}) {
        const vizTargetRoot = document.getElementById('vizTargetRoot');

        for (const {screenshotOutputPath, testName, suiteName} of tests) {
            // This is to call out tests that may be 'hung', which is helpful for debugging
            const hungConsoleWarningTimeout = setTimeout(
                () => {
                    console.log(`${suiteName}/${testName} being slow.`);
                },
                5 * 1000
            );

            const target = vizTargetRoot.appendChild(document.createElement('div'));
            const {testRunner} = this.registeredTests.find((test) => test.testName === testName && test.suiteName === suiteName);
            const testInitializer = this.registeredTestInitializers[suiteName] || noop;
            const testFinalizer = this.registeredTestFinalizers[suiteName] || noop;

            // Run the test to render something to the viewport
            let screenshotTarget;

            try {
                await testInitializer();
                screenshotTarget = await testRunner(target);
            } catch (e) {
                console.error(`Error running test ${suiteName}/${testName}`, e);
            } finally {
                await testFinalizer(target);
            }

            if (!screenshotTarget) {
                throw new Error(`No screenshot target returned from test ${suiteName}/${testName}. Did you forget to 'return'?`);
            }

            await window.takeScreenshot({
                targetRect: (screenshotTarget || target).getBoundingClientRect(),
                screenshotOutputPath,
            });

            vizTargetRoot.removeChild(target);

            await window.resetMouse();

            clearTimeout(hungConsoleWarningTimeout);
        }
    }

    reset() {
        this.registeredSuites = [];
        this.registeredTests = [];
        this.currentSuiteName = null;
    }
}
