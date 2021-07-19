type Viewport = [number, number]

type ScreenshotTarget = Node | null | undefined

/**
 * Create a test suite.
 *
 * @param suiteName      - test suite name
 * @param testCreator    - function that creates tests
 * @param suiteViewports - optional test viewports
 */
export function describe(
    suiteName: string,
    testCreator: () => void,
    suiteViewports?: Viewport[]
): void

/**
 * Initialize each test within a suite.
 *
 * @param testInitializer - code to run before each test
 */
export function beforeEach(
    testInitializer: () => (void | Promise<void>)
): void

/**
 * Finalize each test within a suite.
 *
 * @param testFinalizer - code to run after each test
 */
export function afterEach(
    testFinalizer: (element: Element) => (void | Promise<void>)
): void

/**
 * Create a test.
 *
 * @param testName      - name of the test
 * @param testRunner    - code to execute
 * @param testViewports - optional viewports
 */
export function test(
    testName: string,
    testRunner: (element: Element) => (ScreenshotTarget | Promise<ScreenshotTarget>),
    testViewports?: Viewport[]
): void

/**
 * Alias for {@link test}.
 */
export function it(
    testName: string,
    testRunner: (element: Element) => (ScreenshotTarget | Promise<ScreenshotTarget>),
    testViewports?: Viewport[]
): void

/**
 * Hover the element at the specified selector.
 *
 * @param selector - selector of element to hover
 * @return {Promise<void>} promise that resolves when the hover state has been applied
 */
export function click(
    selector: string
): Promise<void>

/**
 * Click the element at the specified selector.
 *
 * @param selector - selector of element to lick
 * @return {Promise<void>} promise that resolves after the element has been clicked
 */
export function hover(
    selector: string
): Promise<void>
