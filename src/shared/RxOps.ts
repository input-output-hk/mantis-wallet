import * as rx from 'rxjs'
import * as rxop from 'rxjs/operators'

export const tapEval = <A>(evalCb: (a: A) => Promise<void>): rx.OperatorFunction<A, A> =>
  rxop.concatMap((a: A) => evalCb(a).then(() => a))
