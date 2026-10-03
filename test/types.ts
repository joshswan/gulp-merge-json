/*!
 * Copyright 2015-2026 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/gulp-merge-json/blob/main/LICENSE
 */

// Type checked by `pnpm lint` to make sure the published declarations work for consumers.
import merge = require('gulp-merge-json');

const stream: NodeJS.ReadWriteStream = merge();

merge({
  fileName: 'merged.json',
  edit: (json, file) => ({ ...json, path: file.path }),
  transform: (json) => json,
  startObj: [],
  endObj: { key: 'value' },
  exportModule: 'const data',
  concatArrays: true,
  mergeArrays: false,
  customizer: (objValue, srcValue) => srcValue ?? objValue,
  jsonReviver: (key, value) => value,
  jsonReplacer: (key, value) => value,
  jsonSpace: 2,
  json5: true,
});

process.stdin.pipe(stream).pipe(process.stdout);
