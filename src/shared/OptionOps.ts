import {option} from 'fp-ts'
import {Option} from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/pipeable'

export const toArray = <A>(optionA: Option<A>): readonly A[] =>
  option.fold(
    () => [],
    (a: A) => [a],
  )(optionA)

export const zip = <A>(maybeA: Option<A>) => <B>(maybeB: Option<B>): Option<[A, B]> =>
  pipe(
    maybeA,
    option.chain((a) =>
      pipe(
        maybeB,
        option.map((b) => [a, b]),
      ),
    ),
  )
