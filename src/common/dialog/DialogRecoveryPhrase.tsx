import React, {useState} from 'react'
import SVG from 'react-inlinesvg'
import './DialogRecoveryPhrase.scss'
import {InlineError} from '../InlineError'
import checkIcon from '../../assets/icons/check.svg'

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

const RecoveryWord: React.FunctionComponent<RecoveryWordProps> = ({
  word,
  onClick,
  used,
}: RecoveryWordProps) => {
  return used ? (
    <div className="used-word">
      <SVG src={checkIcon} className="check" />
    </div>
  ) : (
    <div className="word" onClick={onClick}>
      {word}
    </div>
  )
}

export const DialogRecoveryPhrase: React.FunctionComponent<DialogRecoveryProps> = ({
  recoveryPhraseShuffled,
  recoveryPhraseValidation,
  setRecoveryPhraseValidated,
}: DialogRecoveryProps) => {
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
  }

  const showValidationError =
    enteredPhrase.length === recoveryPhraseShuffled.length &&
    !recoveryPhraseValidation(enteredPhrase)

  return (
    <div className="DialogRecoveryPhrase">
      <div className="instructions">Re-input seed phrase by selecting words from selection</div>
      <InlineError
        className="input"
        errorMessage={showValidationError ? 'The phrase is incorrect' : ''}
      >
        {enteredPhrase.join(' ')}
      </InlineError>
      <div className="clear-container">
        <span className="clear" onClick={clear}>
          Clear
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