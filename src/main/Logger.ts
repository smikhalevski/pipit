import { PubSub } from 'parallel-universe';
import { Level } from './Level.js';
import type { LoggerEvent, LogMessage, LogMessagesHandler, LogProcessor } from './types.js';

/**
 * Dispatches logged messages to channels.
 */
export class Logger<Args extends any[] = any[], Context = any> {
  /**
   * The minimum log level of messages that would be dispatched to channels.
   */
  level: number;

  /**
   * The context that is added to dispatched messages.
   */
  context: Context;

  /**
   * The list of channels.
   */
  protected _channels: Array<(messages: LogMessage[]) => void> = [];

  protected _pubSub = new PubSub<LoggerEvent>();

  /**
   * Creates the new {@link Logger} instance.
   *
   * @param level The minimum log level of messages that would be dispatched to channels.
   *
   */
  constructor(level?: number);

  /**
   * Creates the new {@link Logger} instance.
   *
   * @param level The minimum log level of messages that would be dispatched to channels.
   * @param context The context that is added to dispatched messages.
   */
  constructor(level: number, context: Context);

  constructor(level = 0, context?: any) {
    this.level = level;
    this.context = context;
  }

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
  trace = (...args: Args): void => {
    if (this.isTraceEnabled) {
      dispatch(this._channels, Level.TRACE, args, this.context);
    }
  };

  /**
   * Log a fine-grained informational message that are most useful to debug an application.
   */
  debug = (...args: Args): void => {
    if (this.isDebugEnabled) {
      dispatch(this._channels, Level.DEBUG, args, this.context);
    }
  };

  /**
   * Log an informational message that highlight the progress of the application at coarse-grained level.
   */
  info = (...args: Args): void => {
    if (this.isInfoEnabled) {
      dispatch(this._channels, Level.INFO, args, this.context);
    }
  };

  /**
   * Log a potentially harmful situation.
   */
  warn = (...args: Args): void => {
    if (this.isWarnEnabled) {
      dispatch(this._channels, Level.WARN, args, this.context);
    }
  };

  /**
   * Log an error event that might still allow the application to continue running.
   */
  error = (...args: Args): void => {
    if (this.isErrorEnabled) {
      dispatch(this._channels, Level.ERROR, args, this.context);
    }
  };

  /**
   * Log a very severe error events that will presumably lead the application to abort.
   */
  fatal = (...args: Args): void => {
    if (this.isFatalEnabled) {
      dispatch(this._channels, Level.FATAL, args, this.context);
    }
  };

  /**
   * Log an informational message that highlight the progress of the application at coarse-grained level.
   *
   * The alias for {@link info}.
   */
  log = this.info;

  /**
   * Removes all channels, unsubscribes all subscribers, and resets the log level.
   *
   * @param level The new log level.
   * @param context
   */
  reset(level = this.level, context = this.context): this {
    this.level = level;
    this.context = context;

    this._channels = [];
    this._pubSub.unsubscribeAll();

    return this;
  }

  /**
   * Creates a new channel and appends it to this logger.
   *
   * @param processors Processors that are added to a channel.
   */
  addChannel(...processors: LogProcessor[]): this;

  addChannel() {
    if (arguments.length === 0) {
      return this;
    }

    let channel: (messages: LogMessage[]) => void = noop;

    for (let i = arguments.length; i-- > 0; ) {
      const handler: LogMessagesHandler = (0, arguments[i])(this);
      const next = channel;

      channel = messages => handler(messages, next);
    }

    this._channels.push(channel);

    return this;
  }

  /**
   * Notifies processors that all messages that are not yet dispatched, should be dispatched immediatelly.
   */
  flush(): void {
    this.publish({ type: 'flush' });
  }

  subscribe(listener: (event: LoggerEvent) => void): () => void {
    return this._pubSub.subscribe(listener);
  }

  publish(event: LoggerEvent): void {
    this._pubSub.publish(event);
  }
}

function dispatch(channels: Array<(messages: LogMessage[]) => void>, level: number, args: any[], context: any): void {
  for (const channel of channels) {
    try {
      channel([{ timestamp: Date.now(), level, args, context }]);
    } catch (error) {
      setTimeout(die, 0, error);
    }
  }
}

function die(error: unknown): never {
  throw error;
}

function noop(): void {}
