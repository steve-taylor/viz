module.exports = async function ({
    screenshotOutputPath,
    clip,
    page,
}) {
    await page.screenshot({
        type: 'png',
        path: screenshotOutputPath,
        clip,
        omitBackground: true,
    });
};
