import { Level } from './Level.js';
import { LogDispatcher, LoggerChannel } from './LoggerChannel.js';

/**
 * Dispatches logged messages to channels.
 */
export class Logger implements LogDispatcher {
  /**
   * The list of channels.
   */
  channels: LoggerChannel[] = [];

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
   * Deletes all channels from the logger and resets the log level.
   *
   * @param level The new log level.
   * @returns This logger instance.
   */
  reset(level = 0): this {
    this.level = level;
    this.channels = [];
    return this;
  }

  /**
   * Creates a new channel and appends it to this logger.
   */
  openChannel(): LoggerChannel {
    const channel = new LoggerChannel();

    this.channels.push(channel);

    return channel;
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

  dispatch(level: number, args: any[], context = this.context): void {
    if (this.level > level) {
      return;
    }

    for (const channel of this.channels) {
      try {
        channel.dispatch(level, args, context);
      } catch (error) {
        setTimeout(() => {
          throw error;
        }, 0);
      }
    }
  }
}
