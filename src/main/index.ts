/**
 * The module with the core Pipit functionality.
 *
 * ```ts
 * import logger from 'pipit';
 * ```
 *
 * @module pipit
 */
import { Logger } from './Logger.js';
import writeToConsole from './processor/writeToConsole.js';

export { Level } from './Level.js';
export { Logger } from './Logger.js';
export type { LoggerEvent, LogMessage, LogMessagesHandler, LogProcessor } from './types.js';

const logger = new Logger().addChannel(writeToConsole());

/**
 * The default global logger.
 *
 * By default, writes all messages to console.
 */
export default logger;
