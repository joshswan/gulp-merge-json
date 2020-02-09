/*!
 * Copyright 2015-2020 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/gulp-merge/blob/master/LICENSE
 */

const fs = require('fs');
const gulp = require('gulp');
const Vinyl = require('vinyl');
const merge = require('..');

const PLUGIN_NAME = 'gulp-merge-json';

describe('gulp-merge-json', () => {
  test('combines JSON files', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge());

    stream.on('data', (file) => {
      const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome",', '\t\t"fun"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('modifies property based on input function', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      edit: (json) => {
        if (json.place) {
          json.place = 'New York';
        }

        return json;
      },
    }));

    stream.on('data', (file) => {
      const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome",', '\t\t"fun"', '\t],', '\t"place": "New York",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('adds property based on input function', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      edit: (json) => {
        if (json.settings) {
          json.settings.timezone = 'PST';
        }

        return json;
      },
    }));

    stream.on('data', (file) => {
      const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome",', '\t\t"fun"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true,', '\t\t"timezone": "PST"', '\t}', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('deletes property based on input function', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      edit: (json) => {
        if (json.pet) {
          delete json.pet;
        }

        return json;
      },
    }));

    stream.on('data', (file) => {
      const expected = ['{', '\t"name": "Josh",', '\t"tags": [', '\t\t"awesome",', '\t\t"fun"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('uses supplied start object as base', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      startObj: { initial: 'value' },
    }));

    stream.on('data', (file) => {
      const expected = ['{', '\t"initial": "value",', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome",', '\t\t"fun"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('uses supplied final object to overwrite', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      endObj: { place: 'Las Vegas' },
    }));

    stream.on('data', (file) => {
      const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome",', '\t\t"fun"', '\t],', '\t"place": "Las Vegas",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('outputs a node module when true is passed as the exportModule param', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      exportModule: true,
    }));

    stream.on('data', (file) => {
      const expected = `module.exports = ${['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome",', '\t\t"fun"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '};'].join('\n')}`;

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('does not output a node module when empty string is passed as the exportModule param', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      exportModule: '',
    }));

    stream.on('data', (file) => {
      const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome",', '\t\t"fun"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('outputs the passed variable when a name is passed as the exportModule param', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      exportModule: 'const myVar',
    }));

    stream.on('data', (file) => {
      const expected = `const myVar = ${['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome",', '\t\t"fun"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '};'].join('\n')}`;

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('concats arrays if enabled', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      concatArrays: true,
    }));

    stream.on('data', (file) => {
      const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"cool",', '\t\t"fun",', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('does not merge arrays if disabled', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      mergeArrays: false,
    }));

    stream.on('data', (file) => {
      const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('uses customizer function for merging if supplied in options', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      customizer: (objValue) => objValue,
    }));

    stream.on('data', (file) => {
      const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"cool",', '\t\t"fun"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('does nothing with no files', (done) => {
    const stream = gulp.src('test/empty/*.json').pipe(merge());

    stream.on('end', () => {
      done();
    });

    stream.on('data', () => {
      done(new Error('produced output with no input'));
    });
  });

  test('errors on invalid start object', (done) => {
    try {
      gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({ startObj: 10 }));

      done(new Error('succeeded with invalid start object'));
    } catch (err) {
      expect(err.message).toBe(`${PLUGIN_NAME}: Invalid start and/or end object!`);
      done();
    }
  });

  test('errors on invalid end object', (done) => {
    try {
      gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({ endObj: 10 }));

      done(new Error('succeeded with invalid end object'));
    } catch (err) {
      expect(err.message).toBe(`${PLUGIN_NAME}: Invalid start and/or end object!`);
      done();
    }
  });

  test('errors in editor function', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      edit: () => { throw new Error('Oh no!'); },
    }));

    stream.on('error', (err) => {
      expect(err.message).toBe('Oh no!');
      done();
    });

    stream.on('data', () => {
      done(new Error('succeeded with invalid edit function'));
    });
  });

  test('errors on invalid JSON', (done) => {
    const stream = gulp.src('test/json/invalid.json').pipe(merge());

    stream.on('error', (err) => {
      expect(err.message).toMatch(/Error while parsing .+test(\\|\/)json(\\|\/)invalid\.json: Unexpected token I/);
      done();
    });

    stream.on('data', () => {
      done(new Error('succeeded with invalid JSON'));
    });
  });

  test('errors on stream', (done) => {
    const srcFile = new Vinyl({
      path: 'test/invalid/stream.txt',
      cwd: 'test/',
      base: 'test/json/test1',
      contents: fs.createReadStream('test/json/test1.json'),
    });

    const stream = merge();

    stream.on('error', (err) => {
      expect(err.message).toBe(`${PLUGIN_NAME}: Streaming not supported!`);
      done();
    });

    stream.on('data', () => {
      done(new Error('succeeded on stream'));
    });

    stream.write(srcFile);
    stream.end();
  });

  test('uses jsonReplacer when stringifying if supplied in options', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      jsonReplacer: (key, value) => {
        if (key === 'pet') {
          return undefined;
        }

        return value;
      },
    }));

    stream.on('data', (file) => {
      const expected = ['{', '\t"name": "Josh",', '\t"tags": [', '\t\t"awesome",', '\t\t"fun"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('uses jsonSpace when stringifying if supplied in options', (done) => {
    const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
      jsonSpace: '  ',
    }));

    stream.on('data', (file) => {
      const expected = ['{', '  "name": "Josh",', '  "pet": {', '    "name": "Indy"', '  },', '  "tags": [', '    "awesome",', '    "fun"', '  ],', '  "place": "San Francisco",', '  "settings": {', '    "likesSleep": true', '  }', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('merges JSON files containing arrays when passed an array starting object', (done) => {
    const stream = gulp.src(['test/json/array1.json', 'test/json/array2.json']).pipe(merge({
      startObj: [],
    }));

    stream.on('data', (file) => {
      const expected = ['[', '\t{', '\t\t"a": 1,', '\t\t"b": 2,', '\t\t"c": 3,', '\t\t"d": 4', '\t}', ']'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('concats root-level arrays from JSON files when passed an array starting object and concat option enabled', (done) => {
    const stream = gulp.src(['test/json/array1.json', 'test/json/array2.json']).pipe(merge({
      startObj: [],
      concatArrays: true,
    }));

    stream.on('data', (file) => {
      const expected = ['[', '\t{', '\t\t"a": 1,', '\t\t"b": 2', '\t},', '\t{', '\t\t"c": 3,', '\t\t"d": 4', '\t}', ']'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('parses and combine JSON5 files when enabled', (done) => {
    const stream = gulp.src(['test/json/test1.json5', 'test/json/test2.json5']).pipe(merge({
      json5: true,
    }));

    stream.on('data', (file) => {
      const expected = ['{', "\tname: 'Josh',", '\tpet: {', "\t\tname: 'Indy',", '\t},', '\ttags: [', "\t\t'awesome',", '\t],', "\tplace: 'San Francisco',", '\tsettings: {', '\t\tlikesSleep: true,', '\t},', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('uses jsonReplacer with JSON5 when stringifying if supplied in options', (done) => {
    const stream = gulp.src(['test/json/test1.json5', 'test/json/test2.json5']).pipe(merge({
      json5: true,
      jsonReplacer: (key, value) => {
        if (key === 'pet') {
          return undefined;
        }

        return value;
      },
    }));

    stream.on('data', (file) => {
      const expected = ['{', "\tname: 'Josh',", '\ttags: [', "\t\t'awesome',", '\t],', "\tplace: 'San Francisco',", '\tsettings: {', '\t\tlikesSleep: true,', '\t},', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });

  test('uses jsonSpace with JSON5 when stringifying if supplied in options', (done) => {
    const stream = gulp.src(['test/json/test1.json5', 'test/json/test2.json5']).pipe(merge({
      jsonSpace: '  ',
      json5: true,
    }));

    stream.on('data', (file) => {
      const expected = ['{', "  name: 'Josh',", '  pet: {', "    name: 'Indy',", '  },', '  tags: [', "    'awesome',", '  ],', "  place: 'San Francisco',", '  settings: {', '    likesSleep: true,', '  },', '}'].join('\n');

      expect(file.contents.toString()).toBe(expected);
      done();
    });
  });
});
