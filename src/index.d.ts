type Viewport = [number, number]

declare module viz {
    export function describe(
        suiteName: string,
        testCreator: () => void,
        suiteViewports?: Viewport[]
    ): void

    export function beforeEach(
        testInitializer: () => (void | Promise<void>)
    ): void

    export function afterEach(
        testFinalizer: (element: Element) => (void | Promise<void>)
    ): void

    export function test(
        testName: string,
        testRunner: (element: Element) => (void | Promise<void>),
        testViewports?: Viewport[]
    ): void

    export function it(
        testName: string,
        testRunner: (element: Element) => (void | Promise<void>),
        testViewports?: Viewport[]
    ): void
}
