import {hasAllNeededCharacters} from './DialogPassword'
import {isSome, isNone} from 'fp-ts/lib/Option'
import {assert} from 'chai'

it('checks password validity correctly', () => {
  assert.isTrue(isSome(hasAllNeededCharacters('')), 'Empty string is invalid')
  assert.isTrue(isSome(hasAllNeededCharacters('abcdefghIJKLMNOP')), 'String is missing numbers')
  assert.isTrue(
    isSome(hasAllNeededCharacters('0123456789QRSTUVWXYZ')),
    'String is missing lowercase characters',
  )
  assert.isTrue(
    isSome(hasAllNeededCharacters('0123456789qrstuvwxyz')),
    'String is missing uppercase characters',
  )
  assert.isTrue(isNone(hasAllNeededCharacters('0aA')), 'String should be valid')
})
