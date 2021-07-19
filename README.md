# Viz

Visual regression testing framework. Works with all web frameworks.

[![npm version](https://img.shields.io/npm/v/viz.svg?style=flat)](https://www.npmjs.com/package/viz)
![npm](https://img.shields.io/npm/dw/viz.svg)
![Build Status](https://github.com/steve-taylor/viz/actions/workflows/publish/badge.svg)

## Quick start

Install:

```bash
npm i -D viz
```

Configure Babel in your [configuration file](#configuration), e.g.

```json
{
    "babel": {
        "presets": [
            "@babel/preset-env",
            [
                "@babel/preset-react",
                {
                    "runtime": "automatic"
                }
            ],
            "@babel/preset-typescript"
        ]
    }
}
```

Create some tests using TypeScript (`.viz.tsx`) or JavaScript (`.viz.js` or `.viz.jsx`):

```tsx
// my-component.viz.tsx

import {render, unmountComponentAtNode} from 'react-dom'
import {afterEach, beforeEach, click, describe, hover, test} from 'viz'
import MyComponent from './my-component'

describe('my-component', () => {
    beforeEach(async () => {
        // Setup before each my-component test...
    })

    afterEach(async (target) => {
        // Clean up after each my-component test
        unmountComponentAtNode(target)
    })

    test('basic', async target => {
        // Asynchronously render inside the target DOM node
        await new Promise<void>(resolve => {
            render(
                <MyComponent />,
                target,
                resolve
            )
        })

        // Return the DOM node for Viz to screenshot
        return target.firstChild
    })

    test('disabled', async target => {
        await new Promise<void>(resolve => {
            render(
                <MyComponent disabled/>,
                target,
                resolve
            )
        })

        // Return the DOM node for Viz to screenshot
        return target.firstChild

        // Override the screenshot viewports specified in describe()
    }, [[320, 568], [1024, 768]])

    test('focus', async target => {
        await new Promise<void>(resolve => {
            render(
                <MyComponent />,
                target,
                async () => {
                    // Trigger focus state
                    await click('.MyComponent')
                    resolve()
                }
            )
        })
    })

    test('hover', async target => {
        await new Promise<void>(resolve => {
            render(
                <MyComponent />,
                target,
                async () => {
                    // Trigger hover state
                    await hover('.MyComponent')
                    resolve()
                }
            )
        })
    })

    // Optional screenshot viewports [width, height] (defaults to [1280, 1024])
}, [[320, 568], [768, 1024], [1024, 768], [1280, 768]])
```

Generate baseline screenshots:

```bash
npx viz baseline
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

| Command        | Description                                                                |
| -------------- | -------------------------------------------------------------------------- |
| `viz compile`  | Compile all test cases.                                                    |
| `viz baseline` | Take baseline screenshots.                                                 |
| `viz test`     | Run viz tests, taking screenshots and comparing them against the baseline. |
| `viz help`     | Get help.                                                                  |

### `viz baseline` options

| Option                    | Description                                          |
| --------------------------|------------------------------------------------------|
| `--missing`               | Only take baseline screenshots that don’t yet exist. |
| `--suite SUITE-1 SUITE-2` | Only run specified suites.                           |
| `--skip-compile`          | Don’t compile test. (Assumes they’ve been compiled.) |

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
   viz.runTest('my-component', 'basic')
   ```

Viz will render your test and, from there, you can inspect it.

## Configuration

Viz can be configured via the first of the following files found in your
project's root:

* `viz.json`
* `.vizrc`
* `.viz.js`
* `viz.js`

Valid configuration options are as follows:

| Option                          | Description                                                       | Default                                                        |
|---------------------------------|-------------------------------------------------------------------|----------------------------------------------------------------|
| `chromeExecutablePath`          | Path to external Chrome executable                                |                                                                |
| `concurrentLimit`               | Number of browsers to run in parallel                             | `1`                                                            |
| `defaultViewportWidth`          | Default viewport width in pixels                                  | `1024`                                                         |
| `defaultViewportHeight`         | Default viewport height in pixels                                 | `1080`                                                         |
| `viewportScale `                | Viewport scale                                                    | `1`                                                            |
| `outputPath`                    | Output path for screenshots                                       | `.viz/out`                                                     |
| `testReportOutputDir`           | Path for test reports                                             | `.viz/out/report`                                              |
| `testFilePath`                  | Path to search for test files                                     | Current working directory                                      |
| `testFilePattern`               | File extension (or array of file extensions) of test files        | `[".viz.js", ".viz.jsx", ".viz.tsx"]`                          |
| `testRunnerHtml`                | Optional custom HTML page in which tests should be executed       |                                                                |
| `tmpDir`                        | Optional custom directory to store temporary files                | `.viz/tmp` in the current working directory                    |
| `threshold`                     | Image matching threshold from 0 to 1 (smaller is more sensitive)  | `0`                                                            |
| `includeAA`                     | Whether to disable detecting and ignoring anti-aliased pixels     | `false`                                                        |
| `babel`                         | Babel configuration                                               | `{presets: ['@babel/preset-env', '@babel/preset-typescript']}` |
| `sourceMaps`                    | Whether to include source maps in the build                       | `false`                                                        |

NOTE: If `chromeExecutablePath` isn't specified, Viz tries to find an installation of Chrome and may fail to do so.

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
