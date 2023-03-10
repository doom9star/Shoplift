stname.length - 1);
            }
            this.host = normalized.toLowerCase();
            if (typeof port === 'number') {
                this.port = port;
            }
            else if (typeof port === 'string' && port !== '') {
                this.port = Number.parseInt(port, 10);
            }
            else {
                this.port = 27017;
            }
            if (this.port === 0) {
                throw new error_1.MongoParseError('Invalid port (zero) with hostname');
            }
        }
        else {
            throw new error_1.MongoInvalidArgumentError('Either socketPath or host must be defined.');
        }
        Object.freeze(this);
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        return `new HostAddress('${this.toString(true)}')`;
    }
    /**
     * @param ipv6Brackets - optionally request ipv6 bracket notation required for connection strings
     */
    toString(ipv6Brackets = false) {
        if (typeof this.host === 'string') {
            if (this.isIPv6 && ipv6Brackets) {
                return `[${this.host}]:${this.port}`;
            }
            return `${this.host}:${this.port}`;
        }
        return `${this.socketPath}`;
    }
    static fromString(s) {
        return new HostAddress(s);
    }
    static fromSrvRecord({ name, port }) {
        return HostAddress.fromString(`${name}:${port}`);
    }
}
exports.HostAddress = HostAddress;
exports.DEFAULT_PK_FACTORY = {
    // We prefer not to rely on ObjectId having a createPk method
    createPk() {
        return new bson_1.ObjectId();
    }
};
/**
 * When the driver used emitWarning the code will be equal to this.
 * @public
 *
 * @example
 * ```js
 * process.on('warning', (warning) => {
 *  if (warning.code === MONGODB_WARNING_CODE) console.error('Ah an important warning! :)')
 * })
 * ```
 */
exports.MONGODB_WARNING_CODE = 'MONGODB DRIVER';
/** @internal */
function emitWarning(message) {
    return process.emitWarning(message, { code: exports.MONGODB_WARNING_CODE });
}
exports.emitWarning = emitWarning;
const emittedWarnings = new Set();
/**
 * Will emit a warning once for the duration of the application.
 * Uses the message to identify if it has already been emitted
 * so using string interpolation can cause multiple emits
 * @internal
 */
function emitWarningOnce(message) {
    if (!emittedWarnings.has(message)) {
        emittedWarnings.add(message);
        return emitWarning(message);
    }
}
exports.emitWarningOnce = emitWarningOnce;
/**
 * Takes a JS object and joins the values into a string separated by ', '
 */
function enumToString(en) {
    return Object.values(en).join(', ');
}
exports.enumToString = enumToString;
/**
 * Determine if a server supports retryable writes.
 *
 * @internal
 */
function supportsRetryableWrites(server) {
    return (!!server.loadBalanced ||
        (server.description.maxWireVersion >= 6 &&
            !!server.description.logicalSessionTimeoutMinutes &&
            server.description.type !== common_1.ServerType.Standalone));
}
exports.supportsRetryableWrites = supportsRetryableWrites;
function parsePackageVersion({ version }) {
    const [major, minor, patch] = version.split('.').map((n) => Number.parseInt(n, 10));
    return { major, minor, patch };
}
exports.parsePackageVersion = parsePackageVersion;
/**
 * Fisher???Yates Shuffle
 *
 * Reference: https://bost.ocks.org/mike/shuffle/
 * @param sequence - items to be shuffled
 * @param limit - Defaults to `0`. If nonzero shuffle will slice the randomized array e.g, `.slice(0, limit)` otherwise will return the entire randomized array.
 */
function shuffle(sequence, limit = 0) {
    const items = Array.from(sequence); // shallow copy in order to never shuffle the input
    if (limit > items.length) {
        throw new error_1.MongoRuntimeError('Limit must be less than the number of items');
    }
    let remainingItemsToShuffle = items.length;
    const lowerBound = limit % items.length === 0 ? 1 : items.length - limit;
    while (remainingItemsToShuffle > lowerBound) {
        // Pick a remaining element
        const randomIndex = Math.floor(Math.random() * remainingItemsToShuffle);
        remainingItemsToShuffle -= 1;
        // And swap it with the current element
        const swapHold = items[remainingItemsToShuffle];
        items[remainingItemsToShuffle] = items[randomIndex];
        items[randomIndex] = swapHold;
    }
    return limit % items.length === 0 ? items : items.slice(lowerBound);
}
exports.shuffle = shuffle;
//# sourceMappingURL=utils.js.map                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            import { format } from 'util';
import { enumToString } from './utils';
import { MongoInvalidArgumentError } from './error';

// Filters for classes
const classFilters: any = {};
let filteredClasses: any = {};
let level: LoggerLevel;

// Save the process id
const pid = process.pid;

// current logger
// eslint-disable-next-line no-console
let currentLogger: LoggerFunction = console.warn;

/** @public */
export const LoggerLevel = Object.freeze({
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug'
} as const);

/** @public */
export type LoggerLevel = typeof LoggerLevel[keyof typeof LoggerLevel];

/** @public */
export type LoggerFunction = (message?: any, ...optionalParams: any[]) => void;

/** @public */
export interface LoggerOptions {
  logger?: LoggerFunction;
  loggerLevel?: LoggerLevel;
}

/**
 * @public
 */
export class Logger {
  className: string;

  /**
   * Creates a new Logger instance
   *
   * @param className - The Class name associated with the logging instance
   * @param options - Optional logging settings
   */
  constructor(className: string, options?: LoggerOptions) {
    options = options ?? {};

    // Current reference
    this.className = className;

    // Current logger
    if (!(options.logger instanceof Logger) && typeof options.logger === 'function') {
      currentLogger = options.logger;
    }

    // Set level of logging, default is error
    if (options.loggerLevel) {
      level = options.loggerLevel || LoggerLevel.ERROR;
    }

    // Add all class names
    if (filteredClasses[this.className] == null) {
      classFilters[this.className] = true;
    }
  }

  /**
   * Log a message at the debug level
   *
   * @param message - The message to log
   * @param object - Additional meta data to log
   */
  debug(message: string, object?: unknown): void {
    if (
      this.isDebug() &&
      ((Object.keys(filteredClasses).length > 0 && filteredClasses[this.className]) ||
        (Object.keys(filteredClasses).length === 0 && classFilters[this.className]))
    ) {
      const dateTime = new Date().getTime();
      const msg = format('[%s-%s:%s] %s %s', 'DEBUG', this.className, pid, dateTime, message);
      const state = {
        type: LoggerLevel.DEBUG,
        message,
        className: this.className,
        pid,
        date: dateTime
      } as any;

      if (object) state.meta = object;
      currentLogger(msg, state);
    }
  }

  /**
   * Log a message at the warn level
   *
   * @param message - The message to log
   * @param object - Additional meta data to log
   */
  warn(message: string, object?: unknown): void {
    if (
      this.isWarn() &&
      ((Object.keys(filteredClasses).length > 0 && filteredClasses[this.className]) ||
        (Object.keys(filteredClasses).length === 0 && classFilters[this.className]))
    ) {
      const dateTime = new Date().getTime();
      const msg = format('[%s-%s:%s] %s %s', 'WARN', this.className, pid, dateTime, message);
      const state = {
        type: LoggerLevel.WARN,
        message,
        className: this.className,
        pid,
        date: dateTime
      } as any;

      if (object) state.meta = object;
      currentLogger(msg, state);
    }
  }

  /**
   * Log a message at the info level
   *
   * @param message - The message to log
   * @param object - Additional meta data to log
   */
  info(message: string, object?: unknown): void {
    if (
      this.isInfo() &&
      ((Object.keys(filteredClasses).length > 0 && filteredClasses[this.className]) ||
        (Object.keys(filteredClasses).length === 0 && classFilters[this.className]))
    ) {
      const dateTime = new Date().getTime();
      const msg = format('[%s-%s:%s] %s %s', 'INFO', this.className, pid, dateTime, message);
      const state = {
        type: LoggerLevel.INFO,
        message,
        className: this.className,
        pid,
        date: dateTime
      } as any;

      if (object) state.meta = object;
      currentLogger(msg, state);
    }
  }

  /**
   * Log a message at the error level
   *
   * @param message - The message to log
   * @param object - Additional meta data to log
   */
  error(message: string, object?: unknown): void {
    if (
      this.isError() &&
      ((Object.keys(filteredClasses).length > 0 && filteredClasses[this.className]) ||
        (Object.keys(filteredClasses).length === 0 && classFilters[this.className]))
    ) {
      const dateTime = new Date().getTime();
      const msg = format('[%s-%s:%s] %s %s', 'ERROR', this.className, pid, dateTime, message);
      const state = {
        type: LoggerLevel.ERROR,
        message,
        className: this.className,
        pid,
        date: dateTime
      } as any;

      if (object) state.meta = object;
      currentLogger(msg, state);
    }
  }

  /** Is the logger set at info level */
  isInfo(): boolean {
    return level === LoggerLevel.INFO || level === LoggerLevel.DEBUG;
  }

  /** Is the logger set at error level */
  isError(): boolean {
    return level === LoggerLevel.ERROR || level === LoggerLevel.INFO || level === LoggerLevel.DEBUG;
  }

  /** Is the logger set at error level */
  isWarn(): boolean {
    return (
      level === LoggerLevel.ERROR ||
      level === LoggerLevel.WARN ||
      level === LoggerLevel.INFO ||
      level === LoggerLevel.DEBUG
    );
  }

  /** Is the logger set at debug level */
  isDebug(): boolean {
    return level === LoggerLevel.DEBUG;
  }

  /** Resets the logger to default settings, error and no filtered classes */
  static reset(): void {
    level = LoggerLevel.ERROR;
    filteredClasses = {};
  }

  /** Get the current logger function */
  static currentLogger(): LoggerFunction {
    return currentLogger;
  }

  /**
   * Set the current logger function
   *
   * @param logger - Custom logging function
   */
  static setCurrentLogger(logger: LoggerFunction): void {
    if (typeof logger !== 'function') {
      throw new MongoInvalidArgumentError('Current logger must be a function');
    }

    currentLogger = logger;
  }

  /**
   * Filter log messages for a particular class
   *
   * @param type - The type of filter (currently only class)
   * @param values - The filters to apply
   */
  static filter(type: string, values: string[]): void {
    if (type === 'class' && Array.isArray(values)) {
      filteredClasses = {};
      values.forEach(x => (filteredClasses[x] = true));
    }
  }

  /**
   * Set the current log level
   *
   * @param newLevel - Set current log level (debug, warn, info, error)
   */
  static setLevel(newLevel: LoggerLevel): void {
    if (
      newLevel !== LoggerLevel.INFO &&
      newLevel !== LoggerLevel.ERROR &&
      newLevel !== LoggerLevel.DEBUG &&
      newLevel !== LoggerLevel.WARN
    ) {
      throw new MongoInvalidArgumentError(
        `Argument "newLevel" should be one of ${enumToString(LoggerLevel)}`
      );
    }

    level = newLevel;
  }
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        endListener(event: 'beforeExit', listener: BeforeExitListener): this;
                prependListener(event: 'disconnect', listener: DisconnectListener): this;
                prependListener(event: 'exit', listener: ExitListener): this;
                prependListener(event: 'rejectionHandled', listener: RejectionHandledListener): this;
                prependListener(event: 'uncaughtException', listener: UncaughtExceptionListener): this;
                prependListener(event: 'uncaughtExceptionMonitor', listener: UncaughtExceptionListener): this;
                prependListener(event: 'unhandledRejection', listener: UnhandledRejectionListener): this;
                prependListener(event: 'warning', listener: WarningListener): this;
                prependListener(event: 'message', listener: MessageListener): this;
                prependListener(event: Signals, listener: SignalsListener): this;
                prependListener(event: 'multipleResolves', listener: MultipleResolveListener): this;
                prependListener(event: 'worker', listener: WorkerListener): this;
                prependOnceListener(event: 'beforeExit', listener: BeforeExitListener): this;
                prependOnceListener(event: 'disconnect', listener: DisconnectListener): this;
                prependOnceListener(event: 'exit', listener: ExitListener): this;
                prependOnceListener(event: 'rejectionHandled', listener: RejectionHandledListener): this;
                prependOnceListener(event: 'uncaughtException', listener: UncaughtExceptionListener): this;
                prependOnceListener(event: 'uncaughtExceptionMonitor', listener: UncaughtExceptionListener): this;
                prependOnceListener(event: 'unhandledRejection', listener: UnhandledRejectionListener): this;
                prependOnceListener(event: 'warning', listener: WarningListener): this;
                prependOnceListener(event: 'message', listener: MessageListener): this;
                prependOnceListener(event: Signals, listener: SignalsListener): this;
                prependOnceListener(event: 'multipleResolves', listener: MultipleResolveListener): this;
                prependOnceListener(event: 'worker', listener: WorkerListener): this;
                listeners(event: 'beforeExit'): BeforeExitListener[];
                listeners(event: 'disconnect'): DisconnectListener[];
                listeners(event: 'exit'): ExitListener[];
                listeners(event: 'rejectionHandled'): RejectionHandledListener[];
                listeners(event: 'uncaughtException'): UncaughtExceptionListener[];
                listeners(event: 'uncaughtExceptionMonitor'): UncaughtExceptionListener[];
                listeners(event: 'unhandledRejection'): UnhandledRejectionListener[];
                listeners(event: 'warning'): WarningListener[];
                listeners(event: 'message'): MessageListener[];
                listeners(event: Signals): SignalsListener[];
                listeners(event: 'multipleResolves'): MultipleResolveListener[];
                listeners(event: 'worker'): WorkerListener[];
            }
        }
    }
    export = process;
}
declare module 'node:process' {
    import process = require('process');
    export = process;
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               {
  "_from": "core-js-pure@^3.20.2",
  "_id": "core-js-pure@3.20.2",
  "_inBundle": false,
  "_integrity": "sha512-CmWHvSKn2vNL6p6StNp1EmMIfVY/pqn3JLAjfZQ8WZGPOlGoO92EkX9/Mk81i6GxvoPXjUqEQnpM3rJ5QxxIOg==",
  "_location": "/core-js-pure",
  "_phantomChildren": {},
  "_requested": {
    "type": "range",
    "registry": true,
    "raw": "core-js-pure@^3.20.2",
    "name": "core-js-pure",
    "escapedName": "core-js-pure",
    "rawSpec": "^3.20.2",
    "saveSpec": null,
    "fetchSpec": "^3.20.2"
  },
  "_requiredBy": [
    "/@babel/runtime-corejs3"
  ],
  "_resolved": "https://registry.npmjs.org/core-js-pure/-/core-js-pure-3.20.2.tgz",
  "_shasum": "5d263565f0e34ceeeccdc4422fae3e84ca6b8c0f",
  "_spec": "core-js-pure@^3.20.2",
  "_where": "D:\\JAVASCRIPT\\NEXT\\e-commerce\\node_modules\\@babel\\runtime-corejs3",
  "bugs": {
    "url": "https://github.com/zloirock/core-js/issues"
  },
  "bundleDependencies": false,
  "deprecated": false,
  "description": "Standard library",
  "funding": {
    "type": "opencollective",
    "url": "https://opencollective.com/core-js"
  },
  "gitHead": "da1bf15799afc93d4985392a5d1ce5468db1bdd8",
  "homepage": "https://github.com/zloirock/core-js#readme",
  "keywords": [
    "ES3",
    "ES5",
    "ES6",
    "ES7",
    "ES2015",
    "ES2016",
    "ES2017",
    "ES2018",
    "ES2019",
    "ES2020",
    "ECMAScript 3",
    "ECMAScript 5",
    "ECMAScript 6",
    "ECMAScript 7",
    "ECMAScript 2015",
    "ECMAScript 2016",
    "ECMAScript 2017",
    "ECMAScript 2018",
    "ECMAScript 2019",
    "ECMAScript 2020",
    "Harmony",
    "Strawman",
    "Map",
    "Set",
    "WeakMap",
    "WeakSet",
    "Promise",
    "Observable",
    "Symbol",
    "TypedArray",
    "URL",
    "URLSearchParams",
    "queueMicrotask",
    "setImmediate",
    "polyfill",
    "ponyfill",
    "shim"
  ],
  "license": "MIT",
  "main": "index.js",
  "name": "core-js-pure",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/zloirock/core-js.git"
  },
  "scripts": {
    "postinstall": "node -e \"try{