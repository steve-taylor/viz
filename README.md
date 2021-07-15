# Viz

Visual regression testing framework. Works with all web frameworks.

[![npm version](https://img.shields.io/npm/v/viz.svg?style=flat)](https://www.npmjs.com/package/viz)
![npm](https://img.shields.io/npm/dw/viz.svg)
[![Build Status](https://travis-ci.org/steve-taylor/viz.svg?branch=develop)](https://travis-ci.org/steve-taylor/viz)

## Quick start

Install:

```bash
npm i -D viz
```

Create some tests:

```jsx harmony
// my-component.viz.js

import React from 'react';
import ReactDOM from 'react-dom';
import MyComponent from './my-component';

describe('my-component', () => {
    beforeEach(async () => {
        // Setup before each my-component test...
    });

    afterEach(async (target) => {
        // Clean up after each my-component test
        ReactDOM.unmountComponentAtNode(target);
    });

    test('basic', async (target) => {
        // Asynchronously render inside the target DOM node
        await new Promise((resolve) => {
            ReactDOM.render(
                <MyComponent />,
                target,
                resolve
            );
        });

        // Return the DOM node for Viz to screenshot
        return target.firstChild;
    });

    test('disabled', async (target) => {
        await new Promise((resolve) => {
            ReactDOM.render(
                <MyComponent disabled/>,
                target,
                resolve
            );
        });

        // Return the DOM node for Viz to screenshot
        return target.firstChild;

        // Override the screenshot viewports specified in describe()
    }, [[320, 568], [1024, 768]]);

    // Optional screenshot viewports [width, height] (defaults to [1280, 1024])
}, [[320, 568], [768, 1024], [1024, 768], [1280, 768]]);
```

Generate golden screenshots:

```bash
npx viz make-goldens
```

Test your UI:

```bash
npx viz test
```

## About

Viz generates and compares screenshots of your UI components using Puppeteer.
Integrated into your CI/CD workflow, this allows you to detect unexpected
visual changes to your UI and prevent visual regressions making it to
production.

## CLI usage

```
    viz help         - Show this message
    viz compile      - Compile the local test cases
    viz make-golden  - Make golden screenshots from each of the test cases
             --missing                  - Only take golden screenshots that don't yet exist
             --suite SUITE-1 SUITE-2    - Run specific suites
             --skip-compile             - Don't compile the tests
    viz test         - Make screenshots and test them against the golden screenshots
```

## Debugging tests in the browser

If any of your screenshots aren't being generated as expected, you can run them
individually in a browser.

1. Compile the tests:
   ```bash
   npx viz compile
   ```
2. Start a web server (on port 8080, for example):
   ```bash
   npx serve -l 8080 node_modules/viz
   ```
3. Open http://localhost:8080/bin/runner.html in your browser.
4. Open your browser's JavaScript console.
5. Run the test by suite name and test name, e.g.
   ```js
   viz.runTest('my-component', 'basic');
   ```

Viz will render your test and, from there, you can inspect it.

## Babel support

Viz compiles your tests using Babel. As long as your package has a local
`.babelrc` and the required presets and plugins, Viz should be able to build
your tests.

## TypeScript support

Although viz source is JavaScript, it supports TypeScript via Babel (see above)
and comes with type definitions.

TypeScript support requires viz to be explicitly imported, i.e.

```tsx
// my-component.viz.ts

import {describe, beforeEach, afterEach, test} from 'viz'
```

## Configuration

Viz can be configured via the first of the following files found in your
project's root:

* `viz.json`
* `.vizrc`
* `.viz.js`
* `viz.js`

Valid configuration options are as follows:

| Option                  | Description                                                      | Default                              |
|-------------------------|------------------------------------------------------------------|--------------------------------------|
| `chromeExecutablePath`  | Path to your Chrome executable                                   | Result of `which google-chrome-beta` |
| `concurrentLimit`       | Number of browsers to run in parallel                            | `1`                                  |
| `defaultViewportWidth`  | Default viewport width in pixels                                 | `1024`                               |
| `defaultViewportHeight` | Default viewport height in pixels                                | `1080`                               |
| `outputPath`            | Output path for screenshots                                      | `tmp`                                |
| `testReportOutputDir`   | Path for test reports                                            | `tmp/report`                         |
| `testFilePath`          | Path to search for test files                                    | Current working directory            |
| `testFilePattern`       | File extension (or array of file extensions) of test files       | `[".viz.js", ".viz.ts"]`             |
| `testRunnerHtml`        | Optional custom HTML page in which tests should be executed      |                                      |
| `tmpDir`                | Optional custom directory to store temporary files               |                                      |
| `threshold`             | Image matching threshold from 0 to 1 (smaller is more sensitive) | `0`                                  |
| `includeAA`             | Whether to disable detecting and ignoring anti-aliased pixels    | `false`                              |

## Additional features

### Padding around screenshots

To add padding to a screenshot, wrap the target element in an element with
padding. The screenshot will automatically inherit the parent element's
padding without having to fill it horizontally.

## Roadmap

* Tests
* Improve documentation
* Example repository

## Acknowledgements

Viz is a permanent fork of [Vizard](https://github.com/streamotion/vizard), by Streamotion.
