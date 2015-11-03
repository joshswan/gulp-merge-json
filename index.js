/*!
 * Copyright 2015 Robin Janssens
 * Copyright 2015 Josh Swan
 * Released under the MIT license
 * https://github.com/robinj/gulp-controlled-merge-json/blob/master/LICENSE
 */
'use strict';

var gutil = require('gulp-util');
var merge = require('controlled-merge');
var path = require('path');
var through = require('through');

var PLUGIN_NAME = 'gulp-merge-json';

module.exports = function(fileName, edit, startObj, endObj, exportModule) {
  if ((startObj && typeof startObj !== 'object') || (endObj && typeof endObj !== 'object')) {
    throw new gutil.PluginError(PLUGIN_NAME, PLUGIN_NAME + ': Invalid start and/or end object!');
  }

  var editFunc;

  if (typeof edit === 'function') {
    editFunc = edit;
  } else if (typeof edit === 'object') {
    editFunc = function(json) {
      return merge(json, edit);
    };
  } else {
    editFunc = function(json) {
      return json;
    };
  }

  var merged = startObj || {};
  var firstFile = null;
  var conflictingKeys = [];

  function parseAndMerge(file) {
    if (file.isNull()) {
      return this.queue(file);
    }

    if (file.isStream()) {
      return this.emit('error', new gutil.PluginError(PLUGIN_NAME, PLUGIN_NAME + ': Streaming not supported!'));
    }

    if (!firstFile) {
      firstFile = file;
    }

    try {
      merged = merge(
        function(val1, val2, key) {
          conflictingKeys.push({
            'val1': val1,
            'val2': val2,
            'key': key,
            'filePath': file.path
          });
          // There is no way to tell which value should be used, so just use the first one
          return val1;
        }, [merged, editFunc(JSON.parse(file.contents.toString('utf8')))]);
    } catch (err) {
      return this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
    }
  }

  function endStream() {
    if (!firstFile) {
      return this.emit('end');
    }

    if (endObj) {
      merged = merge(merged, endObj);
    }

    var contents = JSON.stringify(merged, null, '\t');

    if (exportModule) {
      contents = 'module.exports = ' + contents + ';';
    }

    var output = new gutil.File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: path.join(firstFile.base, fileName),
      contents: new Buffer(contents),
    });

    this.emit('data', output);
    this.emit('end');
  }

  return through(parseAndMerge, endStream);
};