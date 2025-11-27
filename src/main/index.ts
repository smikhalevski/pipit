import { Logger } from './Logger.js';
import writeToConsole from './processor/writeToConsole.js';

export { Level } from './Level.js';
export { Logger } from './Logger.js';
export type { LogDispatcher, LogProcessor, LogMessage } from './types.js';

/**
 * The default global logger.
 *
 * By default, writes all messages to console.
 */
export default new Logger().addChannel(writeToConsole());
