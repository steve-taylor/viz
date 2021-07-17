import noop from 'lodash/noop';

export function _setup() {
    Object.assign(window, {
        resetMouse: noop,
        takeScreenshot: (args) => console.log('Screenshot would be taken with these args', args),
        puppeteerHover: (selector) => console.log('This test involves hovering on this element', document.querySelector(selector)),
        puppeteerClick: (selector) => document.querySelector(selector).click(),
    });

    if (!window.viz._getTests().length) {
        window.viz._registerTests();
    }

    // Clear the target root
    const targetRoot = document.getElementById('vizTargetRoot');

    while (targetRoot.hasChildNodes()) {
        targetRoot.removeChild(targetRoot.lastChild);
    }
}

export async function runTest(suiteName, testName) {
    _setup();

    const allTests = window.viz._getTests();
    const test = allTests.find((test) => test.suiteName === suiteName && test.testName === testName);

    if (!test) {
        console.warn(`No such test: ${suiteName}/${testName}. Run window.viz._getTests() to see what's available.`);

        return;
    }

    const testTarget = document.getElementById('vizTargetRoot').appendChild(document.createElement('div'));

    console.log(`Running visualisation ${suiteName}/${testName}`);

    const elem = await test.testRunner(testTarget);

    console.log('Screenshot would be taken of this element', elem);
}
