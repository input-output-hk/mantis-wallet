import React, {useState, FunctionComponent} from 'react'
import SVG from 'react-inlinesvg'
import {InlineError} from '../InlineError'
import {fillActionHandlers} from '../util'
import {Trans} from '../Trans'
import {useTranslation} from '../store/settings'
import checkIcon from '../../assets/icons/check.svg'
import './DialogRecoveryPhrase.scss'

interface DialogRecoveryProps {
  recoveryPhraseShuffled: string[]
  recoveryPhraseValidation: (enteredPhrase: string[]) => boolean
  setRecoveryPhraseValidated: (valid: boolean) => void
}

interface RecoveryWordProps {
  used: boolean
  word: string
  onClick: () => void
}

const RecoveryWord: FunctionComponent<RecoveryWordProps> = ({
  word,
  onClick,
  used,
}: RecoveryWordProps) => {
  return used ? (
    <div className="used-word">
      <SVG src={checkIcon} className="check" />
    </div>
  ) : (
    <div className="word" {...fillActionHandlers(onClick)}>
      {word}
    </div>
  )
}

export const DialogRecoveryPhrase: FunctionComponent<DialogRecoveryProps> = ({
  recoveryPhraseShuffled,
  recoveryPhraseValidation,
  setRecoveryPhraseValidated,
}: DialogRecoveryProps) => {
  const {t} = useTranslation()

  const [enteredPhrase, setEnteredPhrase] = useState<string[]>([])
  const [shuffledWords, setShuffledWords] = useState(
    recoveryPhraseShuffled.map((word) => ({word, used: false})),
  )

  const addWord = (word: string, index: number): void => {
    const newEnteredPhrase = [...enteredPhrase, word]
    const newShuffledWords = shuffledWords.map(({word, used}, i) => ({
      word,
      used: index === i || used,
    }))
    setEnteredPhrase(newEnteredPhrase)
    setShuffledWords(newShuffledWords)
    setRecoveryPhraseValidated(recoveryPhraseValidation(newEnteredPhrase))
  }

  const clear = (): void => {
    setEnteredPhrase([])
    setShuffledWords(shuffledWords.map(({word}) => ({word, used: false})))
    setRecoveryPhraseValidated(false)
  }

  const showValidationError =
    enteredPhrase.length === recoveryPhraseShuffled.length &&
    !recoveryPhraseValidation(enteredPhrase)

  return (
    <div className="DialogRecoveryPhrase">
      <div className="instructions">
        <Trans k={['wallet', 'message', 'inputRecoveryPhraseInstructions']} />
      </div>
      <InlineError
        className="input"
        errorMessage={
          showValidationError ? t(['wallet', 'error', 'recoveryPhraseIsIncorrect']) : ''
        }
      >
        {enteredPhrase.join(' ')}
      </InlineError>
      <div className="clear-container">
        <span className="clear" {...fillActionHandlers(clear)}>
          <Trans k={['wallet', 'button', 'clearRecoveryPhraseInput']} />
        </span>
      </div>
      <div className="words">
        {shuffledWords.map(({word, used}, index) => (
          <RecoveryWord
            key={index}
            word={word}
            onClick={(): void => {
              addWord(word, index)
            }}
            used={used}
          />
        ))}
      </div>
    </div>
  )
}
