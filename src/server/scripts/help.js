const packageJson = require('../../../package.json');

module.exports = function printHelp() {
    console.log(`
${packageJson.name} version ${packageJson.version}

Usage:
    ${packageJson.name} help         - Show this message
    ${packageJson.name} compile      - Compile the local test cases
    ${packageJson.name} baseline     - Take baseline screenshots by running all tests
             --missing                  - Only take baseline screenshots that don't yet exist
             --suite SUITE-1 SUITE-2    - Run specific suites
             --skip-compile             - Don't compile the tests
    ${packageJson.name} test         - Take screenshots and test them against the baseline screenshots
`);
};
