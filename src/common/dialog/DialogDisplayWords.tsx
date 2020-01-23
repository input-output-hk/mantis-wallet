import React from 'react'
import './DialogDisplayWords.scss'

interface DialogDisplayWordsProps {
  words: string[]
}

export const DialogDisplayWords: React.FunctionComponent<DialogDisplayWordsProps> = ({
  words,
}: DialogDisplayWordsProps) => (
  <div className="DialogDisplayWords">
    {words.map((word, i) => (
      <div key={i} className="word">
        {word}
      </div>
    ))}
  </div>
)
