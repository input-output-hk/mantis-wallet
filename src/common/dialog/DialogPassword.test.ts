import {assert} from 'chai'
import {hasAllNeededCharacters} from './DialogPassword'

it('checks password validity correctly', async (): Promise<void> => {
  assert.notEqual(hasAllNeededCharacters(''), 'OK', 'Empty string is invalid')
  assert.notEqual(hasAllNeededCharacters('abcdefghIJKLMNOP'), 'OK', 'String is missing numbers')
  assert.notEqual(
    hasAllNeededCharacters('0123456789QRSTUVWXYZ'),
    'OK',
    'String is missing lowercase characters',
  )
  assert.notEqual(
    hasAllNeededCharacters('0123456789qrstuvwxyz'),
    'OK',
    'String is missing uppercase characters',
  )
  assert.equal(hasAllNeededCharacters('0aA'), 'OK', 'String should be valid')
})
