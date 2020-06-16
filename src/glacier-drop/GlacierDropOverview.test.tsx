import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {glacierWrappedRender} from '../common/test-helpers'
import {GlacierDropOverview} from './GlacierDropOverview'

jest.mock('../config/renderer.ts')

test('GlacierDropOverview - basic render', async () => {
  glacierWrappedRender(<GlacierDropOverview />)
})
