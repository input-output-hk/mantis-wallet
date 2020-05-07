import React, {useEffect} from 'react'
import {makeDecorator, StoryContext, StoryGetter} from '@storybook/addons'

const ToFullScreen = (storyFn: StoryGetter, context: StoryContext): JSX.Element => {
  useEffect(() => {
    document.getElementById('main')?.classList.add('no-padding')
  }, [])

  return <>{storyFn(context)}</>
}

export const toFullScreen = makeDecorator({
  name: 'toFullScreen',
  parameterName: 'fullScreen',
  wrapper: ToFullScreen,
})
