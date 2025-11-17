import { Logger } from './Logger.js';
import { printToConsole } from './processors/printToConsole.js';

/**
 * The default global logger.
 *
 * By default, prints all messages to console.
 */
export const logger = new Logger();

logger.openChannel().to(printToConsole());
