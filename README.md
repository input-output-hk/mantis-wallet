# Luna Wallet

Wallet for Midnight.

## Prerequisites

* [Node.js](https://nodejs.org/en/) - v12 is currently used for Luna, tested with v12.16.2.
  * (optional) [nvm](https://github.com/nvm-sh/nvm) - you can use nvm to automatically pick-up the Node version you need
* [yarn](https://classic.yarnpkg.com/en/) - tested with 1.21.1
* (optional) If you want to use Remix from Luna, you will have to setup [git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules#_cloning_submodules) in your project directory. Running these two commands should do the trick: `git submodule init` and `git submodule update`.

## Initialize the project

Running the `yarn` command in the project directory will download the dependencies. After this action, all the script below can be run. 

## Scripts for development

### `yarn build-main`

Builds the main process code to the `build/main` directory. It's required to be run before running `electron-dev` or `electron`

### `yarn start`

Runs the renderer in development mode, it can be accessed at [http://localhost:3000](http://localhost:3000). 

:warning: This will only work through an Electron app - see [`yarn electron-dev`](#yarn-electron-dev)

### `yarn electron-dev`

`yarn electron-dev` will open the Electron application in debug mode.

`yarn electron-dev:hot` will open the Electron application in debug mode with hot reload of the main process. Keep in mind, when using this mode closing the Electron window will not exit the watch mode. If you let it running in the terminal, when a change happens in the main process' code, it will fireup a new window.

:warning: You will have to run [`yarn build-main`](#yarn-build-main) before this action. For *hot* mode run it as `yarn build-main --watch`, so it rebuilds automatically on change.

:warning: The renderer needs to be running - see [`yarn start`](#yarn-start).

### `yarn dev`

This runs [`yarn build-main`](#yarn-build-main) and [`yarn copy-remix`](#yarn-copy-remix) followed by [`yarn electron-dev`](#yarn-electron-dev) and [`yarn start`](#yarn-start) in parallel.

`yarn dev:hot` runs with `yarn build-main --watch` for automatic reload and `yarn electron-dev:hot` for automatic restart on change.

### `yarn storybook`

Starts storybook in debug mode.

### `yarn copy-remix`

Copies `midnight-remix` files to build directory. This step is mandatory, if you want to run Remix from Luna.

## Testing and code health related scripts

### `yarn test`

Launches the test runner in interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

:information_source: This command excludes the screenshot tests.

### `yarn storyshots`

Launches the test runner for the storybook screenshot tests in interactive watch mode.

:information_source: You can use the interactive mode to update the snapshots (`u` command) or you can run `yarn storyshots --updateSnapshot`.

:warning: Since these tests use Storybook, [`yarn storybook`](#yarn-storybook) has to be run before this action.

### `yarn prettier`

Prettifies the code.

### `yarn lint`

Runs all linting: prettier checks, eslint and stylelint.

## Scripts for production

### `yarn build-renderer`

Builds the app for production to the `build` folder.

### `yarn electron`

`yarn build-renderer` and `yarn build-main` followed by `yarn electron` will open the production version of the Electron application.

### `yarn build-storybook`

Creates a static storybook build in the `storybook-static` directory.

### `yarn build-dist`

Packages the application for Linux and Mac in `dist` folder.

### `yarn build-dist-win`

Packages the application for Windows in `dist` folder.

## Windows

Remember to clone the repo with `autocrlf` disabled in git. 
