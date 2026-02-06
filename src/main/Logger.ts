import { PubSub } from 'parallel-universe';
import { Level } from './Level.js';
import type { LoggerEvent, LogMessage, LogMessagesHandler, LogProcessor } from './types.js';

/**
 * Dispatches logged messages to channels.
 *
 * @template Args Arguments of logging methods of the {@link Logger}.
 * @template Context The context that is added to logged messages.
 */
export class Logger<
  Args extends readonly any[] = any[],
  Context extends object | undefined = Record<string, unknown> | undefined,
> {
  /**
   * The minimum log level of messages that would be dispatched to channels.
   */
  level: number;

  /**
   * The context that is added to logged messages.
   */
  context: Context;

  /**
   * The list of channels.
   */
  protected _channels: Array<(messages: LogMessage[]) => void> = [];

  /**
   * The logger event bus.
   */
  protected _pubSub = new PubSub<LoggerEvent>();

  /**
   * Creates the new {@link Logger} instance.
   *
   * @param level The minimum log level of messages that would be dispatched to channels.
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

  /**
   * `true` if {@link trace} messages are logged.
   */
  get isTraceEnabled(): boolean {
    return this.level <= Level.TRACE;
  }

  /**
   * `true` if {@link debug} messages are logged.
   */
  get isDebugEnabled(): boolean {
    return this.level <= Level.DEBUG;
  }

  /**
   * `true` if {@link info} messages are logged.
   */
  get isInfoEnabled(): boolean {
    return this.level <= Level.INFO;
  }

  /**
   * `true` if {@link warn} messages are logged.
   */
  get isWarnEnabled(): boolean {
    return this.level <= Level.WARN;
  }

  /**
   * `true` if {@link error} messages are logged.
   */
  get isErrorEnabled(): boolean {
    return this.level <= Level.ERROR;
  }

  /**
   * `true` if {@link fatal} messages are logged.
   */
  get isFatalEnabled(): boolean {
    return this.level <= Level.FATAL;
  }

  /**
   * Log a finer-grained informational message than the {@link debug}, usually with a stack trace.
   */
  trace = (...args: Args): void => {
    if (this.isTraceEnabled) {
      this._dispatch(Level.TRACE, args, this.context);
    }
  };

  /**
   * Log a fine-grained informational message that are most useful to debug an application.
   */
  debug = (...args: Args): void => {
    if (this.isDebugEnabled) {
      this._dispatch(Level.DEBUG, args, this.context);
    }
  };

  /**
   * Log an informational message that highlight the progress of the application at coarse-grained level.
   */
  info = (...args: Args): void => {
    if (this.isInfoEnabled) {
      this._dispatch(Level.INFO, args, this.context);
    }
  };

  /**
   * Log a potentially harmful situation.
   */
  warn = (...args: Args): void => {
    if (this.isWarnEnabled) {
      this._dispatch(Level.WARN, args, this.context);
    }
  };

  /**
   * Log an error event that might still allow the application to continue running.
   */
  error = (...args: Args): void => {
    if (this.isErrorEnabled) {
      this._dispatch(Level.ERROR, args, this.context);
    }
  };

  /**
   * Log a very severe error events that will presumably lead the application to abort.
   */
  fatal = (...args: Args): void => {
    if (this.isFatalEnabled) {
      this._dispatch(Level.FATAL, args, this.context);
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
   * @param level The minimum log level of messages that would be dispatched to channels.
   * @param context The context that is added to dispatched messages.
   */
  reset(level = this.level, context = this.context): this {
    this.publish({ type: 'reset' });

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

  /**
   * Subscribes to events published by the logger.
   *
   * @param listener The listener callback that is invoked when an event is published.
   * @returns The callback that unsubscribes the listener.
   */
  subscribe(listener: (event: LoggerEvent) => void): () => void {
    return this._pubSub.subscribe(listener);
  }

  /**
   * Publishes an event to subscribers of this logger.
   *
   * @param event The published event.
   */
  publish(event: LoggerEvent): void {
    this._pubSub.publish(event);
  }

  /**
   * Dispatches message to channels.
   *
   * @param level The message level.
   * @param args The message arguments.
   * @param context The message context.
   */
  protected _dispatch(level: number, args: readonly any[], context: any): void {
    for (const channel of this._channels) {
      try {
        channel([
          {
            timestamp: Date.now(),
            level,
            args: args.slice(0),
            context: context !== undefined ? structuredClone(context) : undefined,
          },
        ]);
      } catch (error) {
        setTimeout(die, 0, error);
      }
    }
  }
}

function die(error: unknown): never {
  throw error;
}

function noop(): void {}
