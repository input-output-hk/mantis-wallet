import React, {useState, Ref, forwardRef} from 'react'
import _ from 'lodash'
import * as bip39 from 'bip39'
import {AutoComplete} from 'antd'
import {SelectValue} from 'antd/lib/select'
import './DialogSeedPhrase.scss'

const {Option} = AutoComplete
const wordlist = bip39.wordlists.english

interface DialogSeedPhraseProps {
  onChange(newPhrase: string): void
}

const filterResults = (searchValue: string, results = 5, fromIndex = 0): string[] => {
  if (results <= 0) return []
  const i = _.findIndex(wordlist, (e) => e.startsWith(searchValue), fromIndex)
  return i < 0 ? [] : [wordlist[i], ...filterResults(searchValue, results - 1, i + 1)]
}

const _DialogSeedPhrase: React.RefForwardingComponent<AutoComplete, DialogSeedPhraseProps> = (
  {onChange}: DialogSeedPhraseProps,
  ref: Ref<AutoComplete>,
) => {
  const [phrase, setPhrase] = useState<string>('')
  const [results, setResults] = useState<string[]>([])

  const handleChange = (selectValue: SelectValue): void => {
    const phrase = selectValue.toString()
    setPhrase(phrase)
    onChange(phrase)
  }

  const handleSearch = (fullPhrase: string): void => {
    const words = fullPhrase.split(' ')
    const currentWord = words[words.length - 1]
    const results = currentWord.length === 0 ? [] : filterResults(currentWord.toLowerCase())
    setResults(results)
  }

  const handleSelect = (selection: SelectValue): void => {
    const words = phrase.split(' ').filter((e) => e !== '')
    const newPhrase = [..._.take(words, words.length - 1), selection.toString()].join(' ')
    onChange(newPhrase)
    setPhrase(`${newPhrase} `)
  }

  return (
    <div className="DialogSeedPhrase">
      <AutoComplete
        value={phrase}
        onChange={handleChange}
        onSearch={handleSearch}
        onSelect={handleSelect}
        ref={ref}
      >
        {results.map((result: string) => (
          <Option key={result}>{result}</Option>
        ))}
      </AutoComplete>
    </div>
  )
}

export const DialogSeedPhrase = forwardRef(_DialogSeedPhrase)
