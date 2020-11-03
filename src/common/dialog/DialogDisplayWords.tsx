import React, {FunctionComponent} from 'react'
import './DialogDisplayWords.scss'

interface DialogDisplayWordsProps {
  words: string[]
}

export const DialogDisplayWords: FunctionComponent<DialogDisplayWordsProps> = ({
  words,
}: DialogDisplayWordsProps) => (
  <div className="DialogDisplayWords">
    {words.map((word, i) => (
      <div key={i} className="word">
        <span className="index">{i + 1}.</span> {word}
      </div>
    ))}
  </div>
)
