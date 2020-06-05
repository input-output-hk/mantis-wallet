import React, {useState, Ref, forwardRef} from 'react'
import _ from 'lodash'
import * as bip39 from 'bip39'
import {AutoComplete} from 'antd'
import Select, {SelectValue} from 'antd/lib/select'
import {BorderlessInput} from '../BorderlessInput'
import './DialogSeedPhrase.scss'

const wordlist = bip39.wordlists.english

const FIRST_FIVE_WORDS = _.take(wordlist, 5).map((value) => ({value}))

interface DialogSeedPhraseProps {
  onChange(newPhrase: string): void
}

const filterResults = (searchValue: string, results = 5, fromIndex = 0): string[] => {
  if (results <= 0) return []
  const i = _.findIndex(wordlist, (e) => e.startsWith(searchValue), fromIndex)
  return i < 0 ? [] : [wordlist[i], ...filterResults(searchValue, results - 1, i + 1)]
}

const _DialogSeedPhrase: React.RefForwardingComponent<
  Select<SelectValue>,
  DialogSeedPhraseProps
> = ({onChange}: DialogSeedPhraseProps, ref: Ref<Select<SelectValue>>) => {
  const [phrase, setPhrase] = useState<string>('')
  const [options, setOptions] = useState<Array<{value: string}>>(FIRST_FIVE_WORDS)

  const handleChange = (selectValue: SelectValue): void => {
    const phrase = selectValue.toString()
    setPhrase(phrase)
    onChange(phrase)
  }

  const handleSearch = (fullPhrase: string): void => {
    const words = fullPhrase.split(' ')
    const currentWord = words[words.length - 1]
    const results =
      currentWord.length === 0
        ? FIRST_FIVE_WORDS
        : filterResults(currentWord.toLowerCase()).map((value) => ({value}))
    if (results.length > 0) setOptions(results)
  }

  const handleSelect = (selection: SelectValue): void => {
    const words = phrase.split(' ').filter((e) => e !== '')
    const newPhrase = [..._.take(words, words.length - 1), selection.toString()].join(' ')
    onChange(newPhrase)
    setPhrase(`${newPhrase} `)
  }

  return (
    <div className="DialogSeedPhrase" data-testid="seed-phrase">
      <AutoComplete
        className="select"
        value={phrase}
        onChange={handleChange}
        onSearch={handleSearch}
        onSelect={handleSelect}
        options={options}
        defaultActiveFirstOption
        ref={ref}
      >
        <BorderlessInput />
      </AutoComplete>
    </div>
  )
}

export const DialogSeedPhrase = forwardRef(_DialogSeedPhrase)
