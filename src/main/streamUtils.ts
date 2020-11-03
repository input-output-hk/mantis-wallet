import {Readable} from 'stream'
import {Observable} from 'rxjs'

export const readableToObservable = (readableStream: Readable): Observable<Buffer> =>
  new Observable((subscriber) => {
    readableStream.on('data', (chunk) => subscriber.next(chunk))
    readableStream.on('error', (err) => subscriber.error(err))
    readableStream.on('end', () => subscriber.complete())
    readableStream.on('close', () => subscriber.complete())
  })
