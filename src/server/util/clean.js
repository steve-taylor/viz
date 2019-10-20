const path = require('path');
const fsExtra = require('fs-extra');

module.exports = async function clean({
    config,
    clearGolden = false,
    skipCompile = false,
}) {
    const {tmpDir, outputPath} = config;

    await Promise.all([
        !skipCompile && fsExtra.emptyDir(tmpDir),
        fsExtra.emptyDir(path.join(outputPath, 'tested')),
        fsExtra.emptyDir(path.join(outputPath, 'diff')),
        clearGolden && fsExtra.emptyDir(path.join(outputPath, 'golden')),
    ]);
};
