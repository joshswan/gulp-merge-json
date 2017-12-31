/*!
 * Copyright 2015-2017 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/gulp-merge/blob/master/LICENSE
 */

'use strict';

const _ = require('lodash');
const deprecate = require('deprecate');
const JSON5 = require('json5');
const path = require('path');
const PluginError = require('plugin-error');
const through = require('through');
const Vinyl = require('vinyl');

const PLUGIN_NAME = 'gulp-merge-json';

const mergeOrConcatArrays = (concatArrays, mergeArrays) => (objValue, srcValue) => {
  // Handle array merging
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    if (concatArrays) {
      return objValue.concat(srcValue);
    } else if (!mergeArrays) {
      return srcValue;
    }
  }

  return undefined;
};

function merge(a, b, options) {
  const customizer = options.customizer;
  const concatArrays = options.concatArrays;
  const mergeArrays = options.mergeArrays;

  if (Array.isArray(a) && concatArrays) {
    return a.concat(b);
  }

  return _.mergeWith(a, b, customizer || mergeOrConcatArrays(concatArrays, mergeArrays));
}

module.exports = function mergeJson(fileName, edit, startObj, endObj, exportModule, concatArrays) {
  let options = {
    // Defaults
    fileName: 'combined.json',
    edit: json => json,
    startObj: {},
    endObj: null,
    exportModule: false,
    concatArrays: false,
    mergeArrays: true,
    customizer: null,
    jsonReplacer: null,
    jsonSpace: '\t',
    json5: false,
  };

  if (typeof fileName === 'object') {
    options = Object.assign(options, fileName);
  } else if (arguments.length) {
    // DEPRECATED
    deprecate('Passing multiple arguments is deprecated! Pass an options object instead.');

    options = Object.assign(options, {
      fileName: fileName || options.fileName,
      edit: edit || options.edit,
      startObj: startObj || options.startObj,
      endObj: endObj || options.endObj,
      exportModule: exportModule || options.exportModule,
      concatArrays: concatArrays || options.concatArrays,
    });
  }

  const jsonLib = (options.json5) ? JSON5 : JSON;

  if ((options.startObj && typeof options.startObj !== 'object') || (options.endObj && typeof options.endObj !== 'object')) {
    throw new PluginError(PLUGIN_NAME, `${PLUGIN_NAME}: Invalid start and/or end object!`);
  }

  if (typeof options.edit === 'object') {
    // DEPRECATED
    deprecate('Using an object as an edit function is deprecated! Use a function instead.');

    const obj = options.edit;

    options.edit = json => merge(json, obj, options);
  }

  let merged = options.startObj;
  let firstFile = null;

  function parseAndMerge(file) {
    let parsed;

    if (file.isNull()) {
      return this.queue(file);
    }

    if (file.isStream()) {
      return this.emit('error', new PluginError(PLUGIN_NAME, `${PLUGIN_NAME}: Streaming not supported!`));
    }

    if (!firstFile) {
      firstFile = file;
    }

    try {
      parsed = jsonLib.parse(file.contents.toString('utf8'));
    } catch (err) {
      err.message = `Error while parsing ${file.path}: ${err.message}`;
      return this.emit('error', new PluginError(PLUGIN_NAME, err));
    }

    try {
      merged = merge(merged, options.edit(parsed, file), options);
    } catch (err) {
      return this.emit('error', new PluginError(PLUGIN_NAME, err));
    }
  }

  function endStream() {
    if (!firstFile) {
      return this.emit('end');
    }

    if (options.endObj) {
      merged = merge(merged, options.endObj, options);
    }

    let contents = jsonLib.stringify(merged, options.jsonReplacer, options.jsonSpace);

    if (options.exportModule === true) {
      contents = `module.exports = ${contents};`;
    } else if (options.exportModule) {
      contents = `${options.exportModule} = ${contents};`;
    }

    const output = new Vinyl({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: path.join(firstFile.base, options.fileName),
      contents: new Buffer(contents),
    });

    this.emit('data', output);
    this.emit('end');
  }

  return through(parseAndMerge, endStream);
};
