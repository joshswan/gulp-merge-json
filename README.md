# gulp-merge-json
[![NPM Version](https://badge.fury.io/js/gulp-merge-json.svg)](https://www.npmjs.com/package/gulp-merge-json) [![Build Status](https://travis-ci.org/joshswan/gulp-merge-json.svg?branch=master)](https://travis-ci.org/joshswan/gulp-merge-json) [![Coverage Status](https://coveralls.io/repos/joshswan/gulp-merge-json/badge.svg?branch=master&service=github)](https://coveralls.io/github/joshswan/gulp-merge-json?branch=master) [![Dependency Status](https://david-dm.org/joshswan/gulp-merge-json.svg)](https://david-dm.org/joshswan/gulp-merge-json) [![Dev Dependency Status](https://david-dm.org/joshswan/gulp-merge-json/dev-status.svg)](https://david-dm.org/joshswan/gulp-merge-json#info=devDependencies)

A gulp plugin for deep-merging multiple JSON files into one file. Export as JSON or a node module.

## Usage
```javascript
var merge = require('gulp-merge-json');

/*
	Basic functionality
 */
gulp.src('jsonFiles/**/*.json')
	.pipe(merge('combined.json'))
	.pipe(gulp.dest('./dist'));

/*
	Edit JSON with function
 */
gulp.src('jsonFiles/**/*.json')
	.pipe(merge('combined.json', function(parsedJson, file) {
		if (parsedJson.someValue) {
			delete parsedJson.otherValue;
		}

		return parsedJson;
	}))
	.pipe(gulp.dest('./dist'));

/*
	Provide a default object (files are merged in order so object values will be overwritten)
 */
gulp.src('jsonFiles/**/*.json')
	.pipe(merge('combined.json', false, {someKey: 'defaultValue'}))
	.pipe(gulp.dest('./dist'));

/*
	Provide an overwriting object (merged at the end)
 */
gulp.src('jsonFiles/**/*.json')
	.pipe(merge('combined.json', false, false, {someKey: 'specialValue'}))
	.pipe(gulp.dest('./dist'));

/*
	Use module.exports
 */
gulp.src('jsonFiles/**/*.json')
	.pipe(merge('dataModule.js', false, false, false, true))
	.pipe(gulp.dest('./dist'));

/*
	Use a custom variable to prefix
 */
gulp.src('jsonFiles/**/*.json')
	.pipe(merge('dataModule.js', false, false, false, 'var my.var'))
	.pipe(gulp.dest('./dist'));


/*
   Provide options as an object
*/
gulp.src('jsonFiles/**/*.json')
    .pipe(merge({
        fileName: 'dataModule.js',
        edit: function(parsedJson, file) {
            if (parsedJson.someValue) {
                delete parsedJson.otherValue;
            }
        },
        startObj: {someKey: 'defaultValue'},
        endObj: {someKey: 'specialValue'},
        exportModule: false,
    })
    .pipe(gulp.dest('./dist'));

/*
  Provide replacer and space options for JSON.stringify
*/
gulp.src('jsonFiles/**/*.json')
    .pipe(merge({
        fileName: 'dataModule.js',
        jsonSpace = '  ',
        jsonReplacer = function() {/*...*/}
    })
    .pipe(gulp.dest('./dist'));
```


## Example Input
```JSON
/*
	json/defaults.json
 */
{
	"key1": {
		"data1": "value1",
		"data2": "value2"
	},
	"key2": {
		"dataA": "valueA",
		"dataB": {
			"a": "b",
			"c": "d"
		}
	}
}

/*
	json/development.json
 */
{
	"key1": {
		"data1": "devValue"
	},
	"key2": {
		"dataB": {
			"c": "DEV MODE!"
		}
	},
	"key3": {
		"important": "value"
	}
}
```

## Example Output
```JSON
/*
	dist/combined.json
 */
{
	"key1": {
		"data1": "devValue",
		"data2": "value2"
	},
	"key2": {
		"dataA": "valueA",
		"dataB": {
			"dataA": "valueA",
			"dataB": {
				"a": "b",
				"c": "DEV MODE!"
			}
		}
	},
	"key3": {
		"important": "value"
	}
}
```
