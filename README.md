# **karma-sass-preprocessor**

Karma preprocessor to compile sass and scss files with [node-sass](https://github.com/sass/node-sass).

[![Travis](https://img.shields.io/travis/pvdlg/karma-sass-preprocessor.svg)](https://travis-ci.org/pvdlg/karma-sass-preprocessor)
[![AppVeyor](https://img.shields.io/appveyor/ci/pvdlg/karma-sass-preprocessor.svg)](https://ci.appveyor.com/project/pvdlg/karma-sass-preprocessor)
[![Codecov](https://img.shields.io/codecov/c/github/pvdlg/karma-sass-preprocessor.svg)](https://codecov.io/gh/pvdlg/karma-sass-preprocessor)
[![Greenkeeper badge](https://badges.greenkeeper.io/pvdlg/karma-sass-preprocessor.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/pvdlg/karma-sass-preprocessor.svg)](https://github.com/pvdlg/karma-sass-preprocessor/blob/master/LICENSE)

## Installation

```bash
npm install node-sass @metahub/karma-sass-preprocessor --save-dev
```

## Configuration

All the [node-sass](https://github.com/sass/node-sass) options can be passed to `sassPreprocessor.options`.

In addition the preprocessor accept a `transformPath` function, to rewrite the path on which the files are deployed on the Karma webserver. If not specified, the processed files will be accessible with the same paths as the originals with the extension `.css` instead of `.sass` or `.scss`. For example `test/fixtures/myStyle.scss` will be deployed as `base/test/fixtures.myStyle.css`.

### Standard

```js
module.exports = function(config) {
  config.set({
    files: ['src/sass/main.scss'],

    plugins: ['@metahub/karma-sass-preprocessor', 'karma-*'],
    preprocessors: {
      '**/*.scss': ['sass']
    },

    sassPreprocessor: {
      options: {
        // To include inlined sourcemaps as data URIs
        sourceMap: true,
        // If compiled sass/scss files import external libraries
        includePaths: ['node_modules', 'path/to/imported/lib'],
        outputStyle: 'expanded',
      },
      // File src/sass/main.sccs will be accessible in the unit test on path base/styles/main.css
      transformPath: filePath => filePath.replace(/\.sccs$/, '.css').replace('src/sass', 'styles')
    },
  });
};
```
**_Note: Karma can auto-load plugins named `karma-*` (see [plugins](http://karma-runner.github.io/1.0/config/plugins.html)). Unfortunatly it doesn't work with [scoped packages](https://docs.npmjs.com/misc/scope), therefore `@metahub/karma-sass-preprocessor` has to be explicitly added to the `plugins` configuration. In order to continue to automatically load other plugins you can add `karma-*` to the `plugins` configuration._**

**_Note: `@metahub/karma-sass-preprocessor` embed its own watcher to monitor sass dependency, therefore only the sass entry point has to be configured in Karma. If Karma is configured with `autoWatch: true`, the modification of an imported sass partial will trigger a new build and test run._**

### Configured Preprocessors
See [configured preprocessors](http://karma-runner.github.io/1.0/config/preprocessors.html).

```js
module.exports = function(config) {
  config.set({
    files: ['src/sass/main.scss', 'test/fixtures/myFixture.scss'],

    plugins: ['@metahub/karma-sass-preprocessor', 'karma-*'],
    preprocessors: {
      'src/**/*.scss': ['sass_1'],
      'test/fixtures/**/*.scss': ['sass_2'],
    },

    customPreprocessors: {
      sass_1: {
        base: 'sass',
        options: {
          sourceMap: true,
          precision: 5,
          outputStyle: 'expanded',
        },
      },
      sass_2: {
        base: 'sass',
        // File test/fixtures/myFixture.sccs will be accessible in the unit test on path base/2/myFixture.css
        transformPath: filePath => filePath.replace(/\.sccs$/, '.css').replace('test/fixtures', '2')
        options: {
          sourceMap: false,
          precision: 8,
          outputStyle: 'compressed',
        },
      },
    },
  });
};
```
