import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {glacierWrappedRender} from '../common/test-helpers'
import {GlacierDropOverview} from './GlacierDropOverview'

test('GlacierDropOverview - basic render', async () => {
  glacierWrappedRender(<GlacierDropOverview />)
})
