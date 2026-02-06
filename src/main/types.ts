import type { Logger } from './Logger.js';

/**
 * A generic logger event.
 */
export interface LoggerEvent {
  /**
   * The event type.
   */
  type: 'flush' | 'reset' | (string & {});

  /**
   * The optional event payload.
   */
  payload?: any;
}

/**
 * A single logged message.
 */
export interface LogMessage {
  /**
   * The timestamp when the message was logged.
   */
  timestamp: number;

  /**
   * The message severity level.
   *
   * @see {@link Level}
   */
  level: number;

  /**
   * The array of message arguments.
   */
  args: any[];

  /**
   * Arbitrary message context.
   *
   * @see {@link Logger.context}
   */
  context: any;
}

/**
 * Handles an array of log messages and forwards them to the next handler in the processing chain.
 *
 * @param messages The messages to handle.
 * @param next A callback that invokes the next handler with updated messages.
 */
export type LogMessagesHandler = (messages: LogMessage[], next: (messages: LogMessage[]) => void) => void;

/**
 * A log processor.
 *
 * Creates a {@link LogMessagesHandler} bound to a specific logger instance.
 *
 * @param logger The logger instance associated with this processor.
 * @returns A message handler function.
 */
export type LogProcessor = (logger: Logger) => LogMessagesHandler;
