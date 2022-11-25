/**
 * The logged message.
 */
export interface LogMessage {
  /**
   * The message severity level. See {@linkcode LogLevel} for reference.
   */
  level: number;

  /**
   * The array of message arguments.
   */
  args: any[];

  /**
   * The arbitrary message context. See {@linkcode Logger.context} for more derails.
   */
  context: any;
}

/**
 * Processes messages and passes updated messages to the next processor.
 *
 * @param messages The array of messages to process.
 * @param next Invokes the next processor in the sequence or no-op if there's no more processors.
 */
export type LogProcessor = (messages: LogMessage[], next: (messages: LogMessage[]) => void) => void;

/**
 * Dispatches a logged message.
 */
export interface LogMessageDispatcher {
  /**
   * @param level The message severity level.
   * @param args The array of arguments.
   * @param context The optional message context.
   */
  dispatch(level: number, args: any[], context?: any): void;
}

/**
 * The channel manages the sequence of processors.
 */
export class LoggerChannel implements LogMessageDispatcher {
  /**
   * The list of processors in this channel.
   */
  processors: LogProcessor[] = [];

  /**
   * Appends a processor to the channel.
   *
   * @param processor The processor to append.
   * @return This channel instance.
   */
  to(processor: LogProcessor | LogMessageDispatcher): this {
    if (typeof processor === 'object') {
      const dispatcher = processor;

      processor = (messages, next) => {
        for (const message of messages) {
          dispatcher.dispatch(message.level, message.args, message.context);
        }
        next(messages);
      };
    }
    this.processors.push(processor);
    return this;
  }

  dispatch(level: number, args: any[], context?: any): void {
    callProcessor(this.processors, 0, [{ level, args, context }]);
  }
}

function callProcessor(processors: LogProcessor[], index: number, messages: LogMessage[]): void {
  if (index < processors.length) {
    processors[index](messages, messages => callProcessor(processors, index + 1, messages));
  }
}
