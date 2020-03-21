import path from 'path'
import initStoryshots from '@storybook/addon-storyshots'
import {MatchImageSnapshotOptions} from 'jest-image-snapshot'
import {imageSnapshot, Context} from '@storybook/addon-storyshots-puppeteer'
import puppeteer, {Browser, Page, Base64ScreenShotOptions} from 'puppeteer'
import _ from 'lodash'
import {Theme} from './theme-state'

jest.mock('./config/renderer.ts')

const getCustomBrowser = (): Promise<Browser> =>
  puppeteer.launch({
    args: [
      '--font-render-hinting=none',
      // rest of the arguments where inspired from
      // https://github.com/storybookjs/storybook/blob/eab2a17e26ed8033f9a51bc34f9bc3d97b9974cc/addons/storyshots/storyshots-puppeteer/src/puppeteerTest.ts#L80
      '--no-sandbox ',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  })

const animatedStories: Array<{kind: string; story: string}> = [
  {
    kind: 'Splash Screen',
    story: 'Splash Screen',
  },
  {
    kind: 'Common',
    story: 'Loading',
  },
]

const getMatchOptions = (theme: Theme) => ({
  context,
}: {
  context: Context
}): MatchImageSnapshotOptions => {
  const threshold: Partial<MatchImageSnapshotOptions> = animatedStories.find(
    ({kind, story}) => kind === context.kind && story === context.story,
  )
    ? {
        failureThreshold: 0.2,
        failureThresholdType: 'percent',
      }
    : {}

  return {
    customSnapshotsDir: path.resolve(__dirname, '../image-snapshots'),
    customSnapshotIdentifier: `${theme}-${_.kebabCase(context.kind)}--${_.kebabCase(
      context.story,
    )}`,
    customDiffConfig: {threshold: 0.1},
    blur: 2,
    ...threshold,
  }
}

const beforeScreenshot = (theme: Theme) => (page: Page): Promise<void> => {
  return page.goto(`${page.url()}&theme=${theme}`).then(
    () =>
      new Promise((resolve) =>
        setTimeout(() => {
          resolve()
        }, 600),
      ),
  )
}

const initStoryshotsByTheme = (theme: Theme): void => {
  initStoryshots({
    suite: `Storyshots ${theme}`,
    test: imageSnapshot({
      getScreenshotOptions: (): Base64ScreenShotOptions => ({
        encoding: 'base64',
        fullPage: true,
      }),
      beforeScreenshot: beforeScreenshot(theme),
      getMatchOptions: getMatchOptions(theme),
      getCustomBrowser,
    }),
  })
}

initStoryshotsByTheme('dark')
initStoryshotsByTheme('light')
