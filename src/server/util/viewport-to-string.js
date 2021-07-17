module.exports = function viewportToString(
    config,
    {
        viewportWidth,
        viewportHeight,
    }
) {
    return `${
        viewportWidth ?? config.defaultViewportWidth
    }x${
        viewportHeight ?? config.defaultViewportHeight
    }`;
}
