# gulp-merge

A gulp plugin for deep-merging multiple JSON files into one file. Export as JSON or a node module.

## Usage
```javascript
var merge = require('gulp-merge');

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
```
