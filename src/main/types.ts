/**
 * The logged message.
 */
export interface LogMessage {
  /**
   * The message severity level. See {@link Level} for reference.
   */
  level: number;

  /**
   * The array of message arguments.
   */
  args: any[];

  /**
   * The arbitrary message context. See {@link Logger.context} for more derails.
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
export interface LogDispatcher {
  /**
   * @param level The message severity level.
   * @param args The array of arguments.
   * @param context The optional message context.
   */
  dispatch(level: number, args: any[], context?: any): void;
}
