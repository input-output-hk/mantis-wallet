# luna-wallet

All relevant Luna development

## Available Scripts

In the project directory, you can run:

### `yarn build-main`

Builds the main process code to the `build/main` directory. It's required to be run before running `electron-dev` or `electron`

### `yarn start`

Runs the renderer in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build-renderer`

Builds the app for production to the `build` folder.

### `yarn electron-dev`

`yarn start` followed by `yarn electron-dev` will open the debug Electron application.

### `yarn electron`

`yarn build-renderer` and `yarn build-main` followed by `yarn electron` will open the production version of the Electron application.

### `yarn storybook`

Starts debug storybook.

### `yarn build-storybook`

Creates a static storybook build in the `storybook-static` directory.
