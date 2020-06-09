import chai, {assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {hasAllNeededCharacters} from './DialogPassword'

chai.use(chaiAsPromised)

it('checks password validity correctly', async (): Promise<void> => {
  const validate = (v: string): Promise<void> => hasAllNeededCharacters.validator({}, v)

  await assert.isRejected(validate(''), /.*/, 'Empty string is invalid')
  await assert.isRejected(validate('abcdefghIJKLMNOP'), /.*/, 'String is missing numbers')
  await assert.isRejected(
    validate('0123456789QRSTUVWXYZ'),
    /.*/,
    'String is missing lowercase characters',
  )
  await assert.isRejected(
    validate('0123456789qrstuvwxyz'),
    /.*/,
    'String is missing uppercase characters',
  )
  await assert.isFulfilled(validate('0aA'), 'String should be valid')
})
