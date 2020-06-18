import {copyToClipboard} from './common/clipboard'

jest.mock('./common/clipboard', () => ({copyToClipboard: jest.fn()}))

// Workaround suggested by the official manual
// https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
// eslint-disable-next-line fp/no-mutating-methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

export const mockedCopyToClipboard = copyToClipboard as unknown

afterEach(() => {
  ;(mockedCopyToClipboard as ReturnType<typeof jest.fn>).mockClear()
})

export {}
