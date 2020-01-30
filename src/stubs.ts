/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

// Stubs for testing
class MockWorker {
  constructor(url: any, options: any) {}
  dispatchEvent() {
    return false
  }
  onmessage() {}
  onerror() {}
  postMessage() {}
  addEventListener() {}
  removeEventListener() {}
  terminate() {}
}

export {MockWorker}
