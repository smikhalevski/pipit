import { Level } from './Level.js';
import type { LogDispatcher, LogMessage, LogProcessor } from './types.js';

/**
 * Dispatches logged messages to channels.
 */
export class Logger implements LogDispatcher {
  /**
   * The list of channels.
   */
  protected _channels: LogProcessor[][] = [];

  /**
   * Creates the new {@link Logger} instance.
   *
   * @param level The minimum log level of messages that would be dispatched to channels.
   * @param context The context that is added to dispatched messages.
   */
  constructor(
    public level = 0,
    public context?: any
  ) {}

  get isTraceEnabled(): boolean {
    return this.level <= Level.TRACE;
  }

  get isDebugEnabled(): boolean {
    return this.level <= Level.DEBUG;
  }

  get isInfoEnabled(): boolean {
    return this.level <= Level.INFO;
  }

  get isWarnEnabled(): boolean {
    return this.level <= Level.WARN;
  }

  get isErrorEnabled(): boolean {
    return this.level <= Level.ERROR;
  }

  get isFatalEnabled(): boolean {
    return this.level <= Level.FATAL;
  }

  /**
   * Log a finer-grained informational message than the {@link debug}, usually with a stack trace.
   */
  trace = (...args: any[]): void => {
    this.dispatch(Level.TRACE, args);
  };

  /**
   * Log a fine-grained informational message that are most useful to debug an application.
   */
  debug = (...args: any[]): void => {
    this.dispatch(Level.DEBUG, args);
  };

  /**
   * Log an informational message that highlight the progress of the application at coarse-grained level.
   */
  info = (...args: any[]): void => {
    this.dispatch(Level.INFO, args);
  };

  /**
   * Log a potentially harmful situation.
   */
  warn = (...args: any[]): void => {
    this.dispatch(Level.WARN, args);
  };

  /**
   * Log an error event that might still allow the application to continue running.
   */
  error = (...args: any[]): void => {
    this.dispatch(Level.ERROR, args);
  };

  /**
   * Log a very severe error events that will presumably lead the application to abort.
   */
  fatal = (...args: any[]): void => {
    this.dispatch(Level.FATAL, args);
  };

  /**
   * The alias for {@link info}.
   */
  log = this.info;

  /**
   * Deletes all channels from the logger and resets the log level.
   *
   * @param level The new log level.
   */
  reset(level = 0): this {
    this._channels = [];
    this.level = level;

    return this;
  }

  /**
   * Creates a new channel and appends it to this logger.
   *
   * @param processors Processors that are added to a channel.
   */
  addChannel(...processors: Array<LogProcessor | LogDispatcher>): this;

  addChannel() {
    const channel: LogProcessor[] = [];

    for (let i = 0; i < arguments.length; ++i) {
      if (typeof arguments[i] === 'function') {
        channel.push(arguments[i]);
        continue;
      }

      const dispatcher: LogDispatcher = arguments[i];

      channel.push((messages, next) => {
        for (const message of messages) {
          dispatcher.dispatch(message.level, message.args, message.context);
        }
        next(messages);
      });
    }

    this._channels.push(channel);

    return this;
  }

  dispatch(level: number, args: any[], context = this.context): void {
    if (level < this.level) {
      return;
    }

    for (const channel of this._channels) {
      if (channel.length === 0) {
        continue;
      }

      try {
        callProcessor(channel, 0, [{ level, args, context }]);
      } catch (error) {
        // Unhandled error
        setTimeout(() => {
          throw error;
        }, 0);
      }
    }
  }
}

function callProcessor(processors: LogProcessor[], index: number, messages: LogMessage[]): void {
  processors[index](
    messages,
    ++index === processors.length ? noop : messages => callProcessor(processors, index, messages)
  );
}

function noop() {}
