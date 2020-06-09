/* eslint-disable fp/no-mutation */
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
  onmessage(e: any) {}
  onmessageerror(e: any) {}
  onerror() {}
  postMessage(msg: any) {
    this.onmessage(msg)
  }
  addEventListener(name: string, callback: (e: any) => void) {
    this.onmessage = callback
  }
  removeEventListener() {}
  terminate() {}
}

export {MockWorker}
