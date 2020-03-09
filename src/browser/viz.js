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
            }

            if (!screenshotTarget) {
                throw new Error(`No screenshot target returned from test ${suiteName}/${testName}. Did you forget to 'return'?`);
            }

            let targetRect = screenshotTarget.getBoundingClientRect();

            // If the screenshot target has a parent, add the parent's padding to the clipping rectangle.
            if (screenshotTarget.parentElement && screenshotTarget.parentElement !== target) {
                const {
                    paddingTop,
                    paddingRight,
                    paddingBottom,
                    paddingLeft,
                } = window.getComputedStyle(screenshotTarget.parentElement);

                const paddingTopPx = parseInt(paddingTop.replace('px', '')) || 0;
                const paddingRightPx = parseInt(paddingRight.replace('px', '') || 0);
                const paddingBottomPx = parseInt(paddingBottom.replace('px', '') || 0);
                const paddingLeftPx = parseInt(paddingLeft.replace('px', '') || 0);

                targetRect = {
                    x: targetRect.x - paddingLeftPx,
                    y: targetRect.y - paddingTopPx,
                    width: targetRect.width + paddingLeftPx + paddingRightPx,
                    height: targetRect.height + paddingTopPx + paddingBottomPx,
                };
            }

            await window.takeScreenshot({
                targetRect,
                screenshotOutputPath,
            });

            try {
                await testFinalizer(target);
            } catch (e) {
                console.error(`Error calling afterEach for test ${suiteName}/${testName}`, e);
            }

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
