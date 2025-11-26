import { Logger } from './Logger.js';
import printToConsole from './processor/writeToConsole.js';

export * from './Level.js';
export * from './Logger.js';
export * from './LoggerChannel.js';

/**
 * The default global logger.
 *
 * By default, prints all messages to console.
 */
const logger = new Logger();

logger.openChannel().to(printToConsole());

export default logger;
