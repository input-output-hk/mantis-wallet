import React, {useState} from 'react'
import SVG from 'react-inlinesvg'
import './WalletDialogRecoveryPhrase.scss'

interface WalletDialogRecoveryProps {
  recoveryPhraseShuffled: Array<string>
  recoveryPhraseValidation: (enteredPhrase: Array<string>) => boolean
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
      <SVG src="./icons/check.svg" className="check" />
    </div>
  ) : (
    <div className="word" onClick={onClick}>
      {word}
    </div>
  )
}

export const WalletDialogRecoveryPhrase: React.FunctionComponent<WalletDialogRecoveryProps> = ({
  recoveryPhraseShuffled,
  recoveryPhraseValidation,
  setRecoveryPhraseValidated,
}: WalletDialogRecoveryProps) => {
  const [enteredPhrase, setEnteredPhrase] = useState<Array<string>>([])
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

  return (
    <div className="WalletDialogRecoveryPhrase">
      <div className="instructions">Re-input seed phrase by selecting words from selection</div>
      <div className="input">{enteredPhrase.join(' ')}</div>
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
