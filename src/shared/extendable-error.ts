export abstract class ExtendableError extends Error {
  name: string

  constructor(public message = '') {
    super(message)
    this.name = new.target.name // eslint-disable-line
  }
}
