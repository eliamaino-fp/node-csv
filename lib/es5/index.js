'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Generated by CoffeeScript 2.0.3
// # CSV Stringifier

// Please look at the [README], the [samples] and the [tests] for additional
// information.
var _Stringifier, get, stream, util;

stream = require('stream');

util = require('util');

get = require('lodash.get');

// ## Usage

// This module export a function as its main entry point and return a transform
// stream.

// Refers to the [official prject documentation](http://csv.adaltas.com/stringify/)
// on how to call this function.
module.exports = function () {
  var callback, chunks, data, options, stringifier;
  if (arguments.length === 3) {
    data = arguments[0];
    options = arguments[1];
    callback = arguments[2];
  } else if (arguments.length === 2) {
    if (Array.isArray(arguments[0])) {
      data = arguments[0];
    } else {
      options = arguments[0];
    }
    if (typeof arguments[1] === 'function') {
      callback = arguments[1];
    } else {
      options = arguments[1];
    }
  } else if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      callback = arguments[0];
    } else if (Array.isArray(arguments[0])) {
      data = arguments[0];
    } else {
      options = arguments[0];
    }
  }
  if (options == null) {
    options = {};
  }
  stringifier = new _Stringifier(options);
  if (data) {
    process.nextTick(function () {
      var d, j, len;
      for (j = 0, len = data.length; j < len; j++) {
        d = data[j];
        stringifier.write(d);
      }
      return stringifier.end();
    });
  }
  if (callback) {
    chunks = [];
    stringifier.on('readable', function () {
      var chunk, results;
      results = [];
      while (chunk = stringifier.read()) {
        results.push(chunks.push(chunk));
      }
      return results;
    });
    stringifier.on('error', function (err) {
      return callback(err);
    });
    stringifier.on('end', function () {
      return callback(null, chunks.join(''));
    });
  }
  return stringifier;
};

// You can also use *util.promisify* native function (Node.js 8+) in order to wrap callbacks into promises for more convenient use when source is a readable stream and you are OK with storing entire result set in memory:

// ```
// const { promisify } = require('util');
// const csv = require('csv');
// const stringifyAsync = promisify(csv.stringify);

// //returns promise
// function generateCsv(sourceData) {
//     return stringifyAsync(sourceData);
// }
// ```

// ## `Stringifier([options])`

// Options are documented [here](http://csv.adaltas.com/stringify/).
_Stringifier = function Stringifier() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var base, base1, base10, base11, base12, base13, base2, base3, base4, base5, base6, base7, base8, base9, k, options, v;
  // Immutable options
  options = {};
  for (k in opts) {
    v = opts[k];
    options[k] = v;
  }
  stream.Transform.call(this, options);
  //# Default options
  this.options = options;
  if ((base = this.options).delimiter == null) {
    base.delimiter = ',';
  }
  if ((base1 = this.options).quote == null) {
    base1.quote = '"';
  }
  if ((base2 = this.options).quoted == null) {
    base2.quoted = false;
  }
  if ((base3 = this.options).quotedEmpty == null) {
    base3.quotedEmpty = void 0;
  }
  if ((base4 = this.options).quotedString == null) {
    base4.quotedString = false;
  }
  if ((base5 = this.options).eof == null) {
    base5.eof = true;
  }
  if ((base6 = this.options).escape == null) {
    base6.escape = '"';
  }
  if ((base7 = this.options).header == null) {
    base7.header = false;
  }
  // Normalize the columns option
  this.options.columns = _Stringifier.normalize_columns(this.options.columns);
  if ((base8 = this.options).formatters == null) {
    base8.formatters = {};
  }
  if (this.options.formatters.bool) {
    // Backward compatibility
    this.options.formatters.boolean = this.options.formatters.bool;
  }
  // Custom formatters
  if ((base9 = this.options.formatters).date == null) {
    base9.date = function (value) {
      // Cast date to timestamp string by default
      return '' + value.getTime();
    };
  }
  if ((base10 = this.options.formatters).boolean == null) {
    base10.boolean = function (value) {
      // Cast boolean to string by default
      if (value) {
        return '1';
      } else {
        return '';
      }
    };
  }
  if ((base11 = this.options.formatters).number == null) {
    base11.number = function (value) {
      // Cast number to string using native casting by default
      return '' + value;
    };
  }
  if ((base12 = this.options.formatters).object == null) {
    base12.object = function (value) {
      // Stringify object as JSON by default
      return JSON.stringify(value);
    };
  }
  if ((base13 = this.options).rowDelimiter == null) {
    base13.rowDelimiter = '\n';
  }
  // Internal usage, state related
  if (this.countWriten == null) {
    this.countWriten = 0;
  }
  switch (this.options.rowDelimiter) {
    case 'auto':
      this.options.rowDelimiter = null;
      break;
    case 'unix':
      this.options.rowDelimiter = "\n";
      break;
    case 'mac':
      this.options.rowDelimiter = "\r";
      break;
    case 'windows':
      this.options.rowDelimiter = "\r\n";
      break;
    case 'ascii':
      this.options.rowDelimiter = '\x1E';
      break;
    case 'unicode':
      this.options.rowDelimiter = '\u2028';
  }
  return this;
};

util.inherits(_Stringifier, stream.Transform);

module.exports.Stringifier = _Stringifier;

// ## `Stringifier.prototype.headers`

// Print the header line if the option "header" is "true".
_Stringifier.prototype.headers = function () {
  var headers;
  if (!this.options.header) {
    return;
  }
  if (!this.options.columns) {
    return;
  }
  headers = this.options.columns.map(function (column) {
    return column.header;
  });
  if (this.options.eof) {
    headers = this.stringify(headers) + this.options.rowDelimiter;
  } else {
    headers = this.stringify(headers);
  }
  return stream.Transform.prototype.write.call(this, headers);
};

_Stringifier.prototype.end = function (chunk, encoding, callback) {
  if (this.countWriten === 0) {
    this.headers();
  }
  return stream.Transform.prototype.end.apply(this, arguments);
};

_Stringifier.prototype.write = function (chunk, encoding, callback) {
  var base, e, preserve;
  // Nothing to do if null or undefined
  if (chunk == null) {
    return;
  }
  preserve = (typeof chunk === 'undefined' ? 'undefined' : _typeof(chunk)) !== 'object';
  // Emit and stringify the record if an object or an array
  if (!preserve) {
    // Detect columns from the first record
    if (this.countWriten === 0 && !Array.isArray(chunk)) {
      if ((base = this.options).columns == null) {
        base.columns = _Stringifier.normalize_columns(Object.keys(chunk));
      }
    }
    try {
      this.emit('record', chunk, this.countWriten);
    } catch (error) {
      e = error;
      return this.emit('error', e);
    }
    // Convert the record into a string
    if (this.options.eof) {
      chunk = this.stringify(chunk) + this.options.rowDelimiter;
    } else {
      chunk = this.stringify(chunk);
      if (this.options.header || this.countWriten) {
        chunk = this.options.rowDelimiter + chunk;
      }
    }
  }
  if (typeof chunk === 'number') {
    // Emit the csv
    chunk = '' + chunk;
  }
  if (this.countWriten === 0) {
    this.headers();
  }
  if (!preserve) {
    this.countWriten++;
  }
  return stream.Transform.prototype.write.call(this, chunk, encoding, callback);
};

// ## `Stringifier.prototype._transform(line)`
_Stringifier.prototype._transform = function (chunk, encoding, callback) {
  this.push(chunk);
  return callback();
};

// ## `Stringifier.prototype.stringify(line)`

// Convert a line to a string. Line may be an object, an array or a string.
_Stringifier.prototype.stringify = function (record) {
  var _record, column, columns, containsEscape, containsQuote, containsRowDelimiter, containsdelimiter, delimiter, escape, field, i, j, l, newrecord, quote, ref, ref1, regexp, shouldQuote, type, value;
  if ((typeof record === 'undefined' ? 'undefined' : _typeof(record)) !== 'object') {
    return record;
  }
  columns = this.options.columns;
  delimiter = this.options.delimiter;
  quote = this.options.quote;
  escape = this.options.escape;
  if (!Array.isArray(record)) {
    _record = [];
    if (columns) {
      for (i = j = 0, ref = columns.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        value = get(record, columns[i].key);
        _record[i] = typeof value === 'undefined' || value === null ? '' : value;
      }
    } else {
      for (column in record) {
        _record.push(record[column]);
      }
    }
    record = _record;
    _record = null;
  } else if (columns) {
    // Note, we used to have @options.columns
    // We are getting an array but the user want specified output columns. In
    // this case, we respect the columns indexes
    record.splice(columns.length);
  }
  if (Array.isArray(record)) {
    newrecord = '';
    for (i = l = 0, ref1 = record.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
      field = record[i];
      type = typeof field === 'undefined' ? 'undefined' : _typeof(field);
      if (type === 'string') {

        // fine 99% of the cases, keep going
      } else if (type === 'number') {
        // Cast number to string
        field = this.options.formatters.number(field);
      } else if (type === 'boolean') {
        field = this.options.formatters.boolean(field);
      } else if (field instanceof Date) {
        field = this.options.formatters.date(field);
      } else if (type === 'object' && field !== null) {
        field = this.options.formatters.object(field);
      }
      if (field) {
        if (typeof field !== 'string') {
          return this.emit('error', Error('Formatter must return a string, null or undefined'));
        }
        containsdelimiter = field.indexOf(delimiter) >= 0;
        containsQuote = quote !== '' && field.indexOf(quote) >= 0;
        containsEscape = field.indexOf(escape) >= 0 && escape !== quote;
        containsRowDelimiter = field.indexOf(this.options.rowDelimiter) >= 0;
        shouldQuote = containsQuote || containsdelimiter || containsRowDelimiter || this.options.quoted || this.options.quotedString && typeof record[i] === 'string';
        if (shouldQuote && containsEscape) {
          regexp = escape === '\\' ? new RegExp(escape + escape, 'g') : new RegExp(escape, 'g');
          field = field.replace(regexp, escape + escape);
        }
        if (containsQuote) {
          regexp = new RegExp(quote, 'g');
          field = field.replace(regexp, escape + quote);
        }
        if (shouldQuote) {
          field = quote + field + quote;
        }
        newrecord += field;
      } else if (this.options.quotedEmpty || this.options.quotedEmpty == null && record[i] === '' && this.options.quotedString) {
        newrecord += quote + quote;
      }
      if (i !== record.length - 1) {
        newrecord += delimiter;
      }
    }
    record = newrecord;
  }
  return record;
};

_Stringifier.normalize_columns = function (columns) {
  var column, k, v;
  if (columns == null) {
    return null;
  }
  if (columns != null) {
    if ((typeof columns === 'undefined' ? 'undefined' : _typeof(columns)) !== 'object') {
      throw Error('Invalid option "columns": expect an array or an object');
    }
    if (!Array.isArray(columns)) {
      columns = function () {
        var results;
        results = [];
        for (k in columns) {
          v = columns[k];
          results.push({
            key: k,
            header: v
          });
        }
        return results;
      }();
    } else {
      columns = function () {
        var j, len, results;
        results = [];
        for (j = 0, len = columns.length; j < len; j++) {
          column = columns[j];
          if (typeof column === 'string') {
            results.push({
              key: column,
              header: column
            });
          } else if ((typeof column === 'undefined' ? 'undefined' : _typeof(column)) === 'object' && column != null && !Array.isArray(column)) {
            if (!column.key) {
              throw Error('Invalid column definition: property "key" is required');
            }
            if (column.header == null) {
              column.header = column.key;
            }
            results.push(column);
          } else {
            throw Error('Invalid column definition: expect a string or an object');
          }
        }
        return results;
      }();
    }
  }
  return columns;
};

// [readme]: https://github.com/wdavidw/node-csv-stringify
// [samples]: https://github.com/wdavidw/node-csv-stringify/tree/master/samples
// [tests]: https://github.com/wdavidw/node-csv-stringify/tree/master/test