import { Logger } from './Logger';
import { printToConsole } from './processors';

/**
 * The default global logger.
 *
 * By default, prints all messages to console.
 */
export const logger = new Logger();

logger.openChannel().to(printToConsole());
