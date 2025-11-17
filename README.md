<p align="center">
  <a href="#readme">
    <img src="./images/pipit.png" alt="Pipit">
  </a>
</p>

The universal logger with the pluggable architecture.

```sh
npm install --save-prod pipit
```

<span class="toc-icon">🔰&ensp;</span>[**Usage**](#usage)

- [Logging levels](#logging-levels)
- [Channels](#channels)
- [Processors](#processors)

<span class="toc-icon">🧩&ensp;</span>**Built-in processors**

- [`batchMessages`](#batchmessages)
- [`levelCutoff`](#levelcutoff)
- [`prepend`](#prepend)
- [`prependDateTime`](#prependdatetime)
- [`prependLevel`](#prependlevel)
- [`printToConsole`](#printtoconsole)
- [`sendToSentry`](#sendtosentry)

# Usage

You can start using Pipit as a replacement for `console` logging, no additional configuration is required:

```ts
import logger from 'pipit';

logger.log('Oh, snap!');
```

Logger uses channels to deliver messages. Each channel is a sequence of processors that may filter or enrich messages,
print them to console or stdout, send them to a remote service, write them to a file, and do whatever you want, even
send a push notification.

Let's create a new logger and configure it:

```ts
import { Logger, printToConsole } from 'pipit';

const myLogger = new Logger();

// Open a channel that prints a message to the console
myLogger.openChannel().to(printToConsole());

myLogger.log('Oh, snap!');
```

## Logging levels

Messages can be logged with different severity levels:

```ts
myLogger.fatal('A very severe error events that will presumably lead the application to abort');

myLogger.error('An error event that might still allow the application to continue running');

myLogger.warn('Potentially harmful situation');

myLogger.info('Highlight the progress of the application at coarse-grained level');
// or myLogger.log(…)

myLogger.debug('Useful to debug an application');

myLogger.trace('A finer-grained informational message than debug, usually with a stack trace');
```

By default, `Logger` sends all messages to channels, but you can set a minimum required level of the message severity:

```ts
import { Logger, LogLevel } from 'pipit';

// Log messages that have an error severity level or higher
const myLogger = new Logger(LogLevel.ERROR);

// This message is ignored
myLogger.debug('Hello there');

// This message is logged
myLogger.fatal('Damn!');
```

## Channels

You can open as many channels on a single logger as you need:

```ts
import { levelCutoff, Logger, LogLevel, printToConsole } from 'pipit';
import sendToSentry from 'src/main/plugin/sentry';

const myLogger = new Logger();

myLogger.openChannel().to(printToConsole());

myLogger.openChannel().to(levelCutoff(LogLevel.ERROR)).to(sendToSentry());

myLogger.log('Good job');

myLogger.fatal('A severe error has occurred!');
```

The first message in the example above would be printed to the console, while the second one is printed to console and
sent to Sentry as well.

You can remove all channels using `reset`. This is especially useful if you want to re-configure the default global
logger.

```ts
import logger from 'pipit';
import sendToSentry from 'pipit/processor/sendToSentry';

// Send all messages to Sentry
logger.reset().openChannel().to(sendToSentry());
```

You can also reset the logging level:

```ts
logger.reset(LogLevel.WARN);
```

## Processors

Logger channels are sequences of processors. Processor is a callback that receives an array of messages and performs
arbitrary operations on those messages. When processor has completed its job, it can pass messages to the next processor
in the channel.

To showcase how processors work, let's create a basic processor that prepends a timestamp to each logged message:

```ts
import { Logger, printToConsole } from 'pipit';

const myLogger = new Logger();

myLogger
  .openChannel()
  .to((messages, next) => {
    const date = new Date().toISOString();

    for (const message of messages) {
      message.args.unshift(date);
    }

    next(messages);
  })
  .to(printToConsole());

myLogger.log('Okay, cowboy');
// ⮕ '2022-11-25T16:59:44.286Z Okay, cowboy'
```

You can use a logger or a channel as a processor:

```ts
const myLogger1 = new Logger();
const myLogger2 = new Logger();

myLogger1.openChannel().to(myLogger2);
```

# `batchMessages`

Batches messages using a timeout and/or limit strategy.

```ts
import batchMessages from 'pipit/processor/batchMessages';

myLogger
  .openChannel()
  .to(batchMessages({ timeout: 1_000, limit: 2 }))
  .to(printToConsole());

myLogger.log('No way');
// Does nothing, since not enough messages to dispatch

myLogger.log('Yay');
// ⮕ 'No way'
// ⮕ 'Yay'
```

By default, at most 50 messages are batched in the 1s timeframe. You can provide both the `timeout` and
`limit` options at the same time and when any constraint is hit, then batched messages are sent to the next
processor.

# `levelCutoff`

Excludes messages that have an insufficient severity level.

```ts
import { LogLevel } from 'pipit';
import levelCutoff from 'pipit/processor/levelCutoff';
import printToConsole from 'pipit/processor/printToConsole';

myLogger.openChannel().to(levelCutoff(LogLevel.WARN)).to(printToConsole());

myLogger.info('Something happened');
// Does nothing, since level of this message is INFO

myLogger.fatal('The base is under attack');
// Prints the message, since its level is FATAL
```

This processor comes handy if you have multiple channels in your logger and want some of them to be used only if message
is severe enough.

# `prepend`

Prepends a set args to each message.

```ts
import prepend from 'pipit/processor/prepend';
import printToConsole from 'pipit/processor/printToConsole';

myLogger.openChannel().to(prepend('Hello,')).to(printToConsole());

myLogger.log('Boss');
// ⮕ 'Hello, Boss'
```

# `prependDateTime`

Prepends date and time in ISO format to each message.

```ts
import prependDateTime from 'pipit/processor/prependDateTime';
import printToConsole from 'pipit/processor/printToConsole';

myLogger.openChannel().to(prependDateTime()).to(printToConsole());

myLogger.log('Okay, cowboy');
// ⮕ '2022-11-25T16:59:44.286Z Okay, cowboy'
```

# `prependLevel`

Prepends severity level label to each message.

```ts
import prependLevel from 'pipit/processor/prependLevel';
import printToConsole from 'pipit/processor/printToConsole';

myLogger.openChannel().to(prependLevel()).to(printToConsole());

myLogger.fatal('No way!');
// ⮕ 'FATAL No way
```

# `printToConsole`

Prints messages to the console.

```ts
import printToConsole from 'pipit/processor/printToConsole';

myLogger.openChannel().to(printToConsole());

myLogger.log('Okay');
// ⮕ 'Okay'
```

# `sendToSentry`

Sends a message to [Sentry](https://sentry.io).

```ts
import logger from 'pipit';
import sendToSentry from 'pipit/processor/sendToSentry';
import * as Sentry from '@sentry/browser';

logger.openChannel().to(sendToSentry(Sentry));

logger.log('To the moon!');
// Prints message to console and sends it to Sentry
```
