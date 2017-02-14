/*!
 * Copyright 2015-2017 Josh Swan
 * Released under the MIT license
 * https://github.com/joshswan/gulp-merge/blob/master/LICENSE
 */

const fs = require('fs');
const gulp = require('gulp');
const gutil = require('gulp-util');
const merge = require('../');
const should = require('should');

const PLUGIN_NAME = 'gulp-merge-json';

require('mocha');

it('should combine JSON files', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json'));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should modify property based on input function', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', (json) => {
    if (json.place) {
      json.place = 'New York';
    }

    return json;
  }));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "New York",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should add property based on input function', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', (json) => {
    if (json.settings) {
      json.settings.timezone = 'PST';
    }

    return json;
  }));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true,', '\t\t"timezone": "PST"', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should delete property based on input function', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', (json) => {
    if (json.pet) {
      delete json.pet;
    }

    return json;
  }));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should merge object if given as input function', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', { testing: true }));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"testing": true,', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should use supplied start object as base', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', false, { initial: 'value' }));

  stream.on('data', (file) => {
    const expected = ['{', '\t"initial": "value",', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should use supplied final object to overwrite', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', false, false, { place: 'Las Vegas' }));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "Las Vegas",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should output a node module when true is passed as the exportModule param', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', false, false, false, true));

  stream.on('data', (file) => {
    const expected = `module.exports = ${['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '};'].join('\n')}`;

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should not output a node module when false is passed as the exportModule param', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', false, false, false, false));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should not output a node module when nothing is passed as the exportModule param', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', false, false, false));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should not output a node module when empty string is passed as the exportModule param', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', false, false, false, ''));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should output the passed variable when a name is passed as the exportModule param', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', false, false, false, 'varname'));

  stream.on('data', (file) => {
    const expected = `varname = ${['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '};'].join('\n')}`;

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should concat arrays if enabled', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', false, false, false, false, true));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"cool",', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should do nothing with no files', (done) => {
  const stream = gulp.src('test/empty/*.json').pipe(merge('combined.json'));

  stream.on('end', () => {
    done();
  });

  stream.on('data', () => {
    should.fail(null, null, 'Should have produced no output!');
  });
});

it('should error on invalid start object', (done) => {
  try {
    gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', false, 10));

    should.fail(null, null, 'Should have failed!');
  } catch (err) {
    err.message.should.equal(`${PLUGIN_NAME}: Invalid start and/or end object!`);

    done();
  }
});

it('should error on invalid end object', (done) => {
  try {
    gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', false, false, 10));

    should.fail(null, null, 'Should have failed!');
  } catch (err) {
    err.message.should.equal(`${PLUGIN_NAME}: Invalid start and/or end object!`);

    done();
  }
});

it('should error in editor function', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge('combined.json', () => {
    throw new Error('Oh no!');
  }));

  stream.on('error', (err) => {
    err.message.should.equal('Oh no!');

    done();
  });

  stream.on('data', () => {
    should.fail(null, null, 'Should have failed!');
  });
});

it('should error on invalid JSON', (done) => {
  const stream = gulp.src('test/json/invalid.json').pipe(merge('combined.json'));

  stream.on('error', (err) => {
    err.message.should.match(/Error while parsing .+test\/json\/invalid.json: Unexpected token I/);

    done();
  });

  stream.on('data', () => {
    should.fail(null, null, 'Should have failed!');
  });
});

it('should error on stream', (done) => {
  const srcFile = new gutil.File({
    path: 'test/invalid/stream.txt',
    cwd: 'test/',
    base: 'test/invalid',
    contents: fs.createReadStream('test/invalid/stream.txt'),
  });

  const stream = merge('stream.json');

  stream.on('error', (err) => {
    err.message.should.equal(`${PLUGIN_NAME}: Streaming not supported!`);

    done();
  });

  stream.on('data', () => {
    should.fail(null, null, 'Should have failed!');
  });

  stream.write(srcFile);
  stream.end();
});

it('should merge when file is passed in options object', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({ fileName: 'combined.json' }));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});


it('should allow the editor function in options object', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
    fileName: 'combined.json',
    edit: (json) => {
      if (json.place) {
        json.place = 'New York';
      }

      return json;
    },
  }));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "New York",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should use supplied start object as base when passed in options object', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
    fileName: 'combined.json',
    startObj: { initial: 'value' },
  }));

  stream.on('data', (file) => {
    const expected = ['{', '\t"initial": "value",', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should use supplied final object to overwrite when passed in options object', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
    fileName: 'combined.json',
    endObj: { place: 'Las Vegas' },
  }));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "Las Vegas",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should output a node module when exportModule is true in options object', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
    fileName: 'combined.json',
    exportModule: true,
  }));

  stream.on('data', (file) => {
    const expected = `module.exports = ${['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '};'].join('\n')}`;

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should use jsonReplacer when stringifying if passed in options object', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
    fileName: 'combined.json',
    jsonReplacer: (key, value) => {
      if (key === 'pet') {
        return undefined;
      }

      return value;
    },
  }));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"tags": [', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should use jsonSpace when stringifying if passed in options object', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
    fileName: 'combined.json',
    jsonSpace: '  ',
  }));

  stream.on('data', (file) => {
    const expected = ['{', '  "name": "Josh",', '  "pet": {', '    "name": "Indy"', '  },', '  "tags": [', '    "awesome"', '  ],', '  "place": "San Francisco",', '  "settings": {', '    "likesSleep": true', '  }', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should concat arrays if enabled in options object', (done) => {
  const stream = gulp.src(['test/json/test1.json', 'test/json/test2.json']).pipe(merge({
    fileName: 'combined.json',
    concatArrays: true,
  }));

  stream.on('data', (file) => {
    const expected = ['{', '\t"name": "Josh",', '\t"pet": {', '\t\t"name": "Indy"', '\t},', '\t"tags": [', '\t\t"cool",', '\t\t"awesome"', '\t],', '\t"place": "San Francisco",', '\t"settings": {', '\t\t"likesSleep": true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should merge JSON files containing arrays when passed an array starting object', (done) => {
  const stream = gulp.src(['test/json/array1.json', 'test/json/array2.json']).pipe(merge('combined.json', false, []));

  stream.on('data', (file) => {
    const expected = ['[', '\t{', '\t\t"a": 1,', '\t\t"b": 2,', '\t\t"c": 3,', '\t\t"d": 4', '\t}', ']'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should concat root-level arrays from JSON files when passed an array starting object and concat option enabled', (done) => {
  const stream = gulp.src(['test/json/array1.json', 'test/json/array2.json']).pipe(merge('combined.json', false, [], false, false, true));

  stream.on('data', (file) => {
    const expected = ['[', '\t{', '\t\t"a": 1,', '\t\t"b": 2', '\t},', '\t{', '\t\t"c": 3,', '\t\t"d": 4', '\t}', ']'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should parse and combine JSON5 files when enabled', (done) => {
  const stream = gulp.src(['test/json/test1.json5', 'test/json/test2.json5']).pipe(merge({
    fileName: 'combined.json',
    json5: true,
  }));

  stream.on('data', (file) => {
    const expected = ['{', '\tname: "Josh",', '\tpet: {', '\t\tname: "Indy"', '\t},', '\ttags: [', '\t\t"awesome"', '\t],', '\tplace: "San Francisco",', '\tsettings: {', '\t\tlikesSleep: true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should use jsonReplacer with JSON5 when stringifying if passed in options object', (done) => {
  const stream = gulp.src(['test/json/test1.json5', 'test/json/test2.json5']).pipe(merge({
    fileName: 'combined.json',
    json5: true,
    jsonReplacer: (key, value) => {
      if (key === 'pet') {
        return undefined;
      }

      return value;
    },
  }));

  stream.on('data', (file) => {
    const expected = ['{', '\tname: "Josh",', '\ttags: [', '\t\t"awesome"', '\t],', '\tplace: "San Francisco",', '\tsettings: {', '\t\tlikesSleep: true', '\t}', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});

it('should use jsonSpace with JSON5 when stringifying if passed in options object', (done) => {
  const stream = gulp.src(['test/json/test1.json5', 'test/json/test2.json5']).pipe(merge({
    fileName: 'combined.json',
    jsonSpace: '  ',
    json5: true,
  }));

  stream.on('data', (file) => {
    const expected = ['{', '  name: "Josh",', '  pet: {', '    name: "Indy"', '  },', '  tags: [', '    "awesome"', '  ],', '  place: "San Francisco",', '  settings: {', '    likesSleep: true', '  }', '}'].join('\n');

    file.contents.toString().should.eql(expected);

    done();
  });
});
