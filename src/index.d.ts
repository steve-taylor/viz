export {}

type Viewport = [number, number]

type DescribeFn = (
    suiteName: string,
    testCreator: () => void,
    suiteViewports?: Viewport[]
) => void

type BeforeEachFn = (
    testInitializer: () => (void | Promise<void>)
) => void

type AfterEachFn = (
    testFinalizer: (element: Element) => (void | Promise<void>)
) => void

type TestFn = (
    testName: string,
    testRunner: (element: Element) => (void | Promise<void>),
    testViewports?: Viewport[]
) => void

declare global {
    interface Window {
        describe: DescribeFn
        beforeEach: BeforeEachFn
        afterEach: AfterEachFn
        test: TestFn
        it: TestFn
    }
}
