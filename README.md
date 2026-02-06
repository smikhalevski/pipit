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
- [Context](#context)
- [Events](#events)

<span class="toc-icon">🧩&ensp;</span>**Built-in processors**

- [`batchMessages`](#batchmessages)
- [`levelCutoff`](#levelcutoff)
- [`prependArgs`](#prependargs)
- [`prependLevel`](#prependlevel)
- [`prependTimestamp`](#prependtimestamp)
- [`sendToSentry`](#sendtosentry)
- [`stringifyAsJSON`](#stringifyasjson)
- [`structurizeArgs`](#structurizeargs)
- [`transformArgs`](#transformargs)
- [`writeToConsole`](#writetoconsole)

<span class="toc-icon">🍪&ensp;</span>**Cookbook**

- [Multi-channel structured logging](#multi-channel-structured-logging)
- [Logging computation-intensive values](#logging-computation-intensive-values)

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
import { Logger } from 'pipit';
import writeToConsole from 'pipit/processor/writeToConsole';

const myLogger = new Logger();

// Open a channel that writes a message to the console
myLogger.addChannel(writeToConsole());

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
import { Logger, Level } from 'pipit';

// Log messages that have an error severity level or higher
const myLogger = new Logger(Level.ERROR);

// This message is ignored
myLogger.debug('Hello there');

// This message is logged
myLogger.fatal('Damn!');
```

## Channels

You can open as many channels on a single logger as you need:

```ts
import { Logger, Level } from 'pipit';
import sendToSentry from 'src/main/plugin/sentry';
import levelCutoff from 'pipit/processor/levelCutoff';
import writeToConsole from 'pipit/processor/writeToConsole';

const myLogger = new Logger();

myLogger.addChannel(writeToConsole());

myLogger.addChannel(levelCutoff(Level.ERROR), sendToSentry());

myLogger.log('Good job!');

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
logger.reset().addChannel(sendToSentry());
```

You can also reset the logging level:

```ts
logger.reset(Level.WARN);
```

## Processors

Logger channels are sequences of processors. Processor is a callback that receives an array of messages and performs
arbitrary operations on those messages. When processor has completed its job, it can pass messages to the next processor
in the channel.

To showcase how processors work, let's create a basic processor that prepends a timestamp to each logged message:

```ts
import { type LogProcessor } from 'pipit';

const myLogProcessor: LogProcessor = logger => (messages, next) => {
  for (const message of messages) {
    message.args.unshift(new Date(message.timestamp).toISOString());
  }

  next(messages);
};
```

Now let's use this processor to write message with timestamp to console:

```ts
import { Logger } from 'pipit';
import writeToConsole from 'pipit/processor/writeToConsole';

const myLogger = new Logger();

myLogger.addChannel(myLogProcessor, writeToConsole());

myLogger.log('Okay, cowboy');
// ⮕ '2022-11-25T16:59:44.286Z Okay, cowboy'
```

## Context

Provide a context to a logger:

```ts
const myLogger = new Logger(Level.INFO, { hello: 'world' });
```

Each message contains [a structured clone](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone)
of the context that was captured the moment the message is logged.

[Processors](#processors) may use on the context to change their behavior or enhance logging. Here's a processor that
does structured JSON logging:

```ts
import { type LogProcessor } from 'pipit';

const jsonLogProcessor: LogProcessor = logger => (messages, next) => {
  for (const message of messages) {
    message.args = [JSON.stringify({ ...message.context, text: message.args[0] })];
  }

  next(messages);
};
```

This processor would convert messages to JSON and pass to the next processor. Let's now use it to write JSON messages
to console:

```ts
import { Logger } from 'pipit';
import writeToConsole from 'pipit/processor/writeToConsole';

const myLogger = new Logger({ hello: 'world' });

myLogger.addChannel(jsonLogProcessor, writeToConsole());

myLogger.debug('Okay, cowboy');
// ⮕ '{"hello":"world","text":"Okay, cowboy"}'
```

## Events

Logger may publish events to which subscribers can react.

```ts
const myLogger = new Logger();

myLogger.subscribe(event => {
  // Handle an event here
});

myLogger.publish({ type: 'okay' });
```

Usually you subscribe to a logger events inside your processor:

```ts
import { Logger, type LogProcessor } from 'pipit';

const myLogProcessor: LogProcessor = logger => {
  logger.subscribe(event => {
    // Handle an event here
  });

  return (messages, next) => next(messages);
};

const myLogger = new Logger();

myLogger.addChannel(myLogProcessor);
```

# Built-in processors

## `batchMessages`

Batches messages using a timeout and/or limit strategy.

```ts
import batchMessages from 'pipit/processor/batchMessages';
import writeToConsole from 'pipit/processor/writeToConsole';

myLogger.addChannel(batchMessages({ timeout: 1_000, limit: 2 }), writeToConsole());

myLogger.log('No way');
// Does nothing, since not enough messages to dispatch

myLogger.log('Yay');
// ⮕ 'No way'
// ⮕ 'Yay'
```

By default, at most 50 messages are batched in the 100 msec timeframe. You can provide both the `timeout` and `limit`
options at the same time and when any constraint is hit, then batched messages are sent to the next processor.

## `levelCutoff`

Excludes messages that have an insufficient severity level.

```ts
import { Level } from 'pipit';
import levelCutoff from 'pipit/processor/levelCutoff';
import writeToConsole from 'pipit/processor/writeToConsole';

myLogger.addChannel(levelCutoff(Level.WARN), writeToConsole());

myLogger.info('Something happened');
// Does nothing, since level of this message is INFO

myLogger.fatal('The base is under attack');
// Prints the message, since its level is FATAL
```

This processor comes handy if you have multiple channels in your logger and want some of them to be used only if message
is severe enough.

## `prependArgs`

Prepends a set args to each message.

```ts
import prependArgs from 'pipit/processor/prependArgs';
import writeToConsole from 'pipit/processor/writeToConsole';

myLogger.addChannel(prependArgs('Hello,'), writeToConsole());

myLogger.log('Boss');
// ⮕ 'Hello, Boss'
```

## `prependLevel`

Prepends severity level label to each message.

```ts
import prependLevel from 'pipit/processor/prependLevel';
import writeToConsole from 'pipit/processor/writeToConsole';

myLogger.addChannel(prependLevel(), writeToConsole());

myLogger.fatal('No way!');
// ⮕ 'FATAL No way
```

Colorize the level label:

```ts
myLogger.addChannel(prependLevel({ isColorized: true }), writeToConsole());

myLogger.fatal('No way!');
// ⮕ '\x1b[7m FATAL \x1b[27m No way
```

## `prependTimestamp`

Prepends date and time in ISO format to each message.

```ts
import prependTimestamp from 'pipit/processor/prependTimestamp';
import writeToConsole from 'pipit/processor/writeToConsole';

myLogger.addChannel(prependTimestamp(), writeToConsole());

myLogger.log('Okay, cowboy');
// ⮕ '2022-11-25 16:59:44.286 Okay, cowboy'
```

Omit date and/or milliseconds for better readability:

```ts
myLogger.addChannel(prependTimestamp({ noDate: true, noMilliseconds: true }), writeToConsole());

myLogger.log('Okay, cowboy');
// ⮕ '16:59:44 Okay, cowboy'
```

## `sendToSentry`

Sends a message to [Sentry](https://sentry.io).

```ts
import sendToSentry from 'pipit/processor/sendToSentry';
import * as Sentry from '@sentry/browser';

myLogger.addChannel(sendToSentry(Sentry));

myLogger.log('To the moon!');
// Sends message to Sentry, no outher output
```

Logger context is sent to Sentry:

```ts
const myLogger = new Logger(Level.ERROR, { origin: 'Earth' });

myLogger.addChannel(sendToSentry(Sentry));

myLogger.log('To the moon!');
// Sends message to Sentry with context {"origin":"Earth"}
```

## `stringifyAsJSON`

Replaces message arguments with a JSON-stringified value of the first argument.

```ts
import stringifyAsJSON from 'pipit/processor/stringifyAsJSON';
import writeToConsole from 'pipit/processor/writeToConsole';

myLogger.addChannel(stringifyAsJSON(), writeToConsole());

myLogger.log({ hello: 'world' });
// ⮕ {"hello":"world"}
```

## `structurizeArgs`

Squashes message arguments into an object.

```ts
import structurizeArgs from 'pipit/processor/structurizeArgs';
import writeToConsole from 'pipit/processor/writeToConsole';

myLogger.addChannel(structurizeArgs(), writeToConsole());

myLogger.log('To the moon!');
// ⮕ { timestamp: 1767277876893, level: 'info', message: 'To the moon!'}
```

For structured logging, use `structurizeArgs` in conjunction with [`stringifyAsJSON`](#stringifyasjson):

```ts
import structurizeArgs from 'pipit/processor/structurizeArgs';
import stringifyAsJSON from 'pipit/processor/stringifyAsJSON';
import writeToConsole from 'pipit/processor/writeToConsole';

myLogger.addChannel(structurizeArgs(), stringifyAsJSON(), writeToConsole());

myLogger.log('To the moon!');
// ⮕ '{"timestamp":"2026-01-01T14:31:16.893Z","level":"info","message":"To the moon!"}'
```

Logger context is squashed with the message payload:

```ts
const myLogger = new Logger(Level.ERROR, { origin: 'Earth' });

myLogger.addChannel(structurizeArgs(), writeToConsole());

myLogger.log('To the moon!');
// ⮕ { timestamp: 1767277876893, level: 'info', origin: 'Earth', message: 'To the moon!'}
```

## `transformArgs`

Transforms message arguments before passing it to the next processor.

```ts
import transformArgs from 'pipit/processor/transformArgs';
import writeToConsole from 'pipit/processor/writeToConsole';

myLogger.addChannel(
  transformArgs(message => ['Hello, ', ...message.args]),
  writeToConsole()
);

myLogger.log('Bob');
// ⮕ 'Hello, Bob'
```

## `writeToConsole`

Prints messages to the console.

```ts
import writeToConsole from 'pipit/processor/writeToConsole';

myLogger.addChannel(writeToConsole());

myLogger.log('Okay');
// ⮕ 'Okay'
```

# Cookbook

## Multi-channel structured logging

Write structured JSON messages to the console and send errors to Sentry as well.

```ts
import * as Sentry from '@sentry/browser';
import logger, { Level } from 'pipit';
import structurizeArgs from 'pipit/processor/structurizeArgs';
import stringifyAsJSON from 'pipit/processor/stringifyAsJSON';
import writeToConsole from 'pipit/processor/writeToConsole';
import levelCutoff from 'pipit/processor/levelCutoff';
import sendToSentry from 'pipit/processor/sendToSentry';

// Discard the default console logging config
logger.reset();

// Structured console logging
logger.addChannel(structurizeArgs(), stringifyAsJSON(), writeToConsole());

// Send errors to Sentry
logger.addChannel(levelCutoff(Level.ERROR), sendToSentry(Sentry));
```

Now errors are written to console and sent to Sentry:

```ts
logger.error('Ooops!');
```

And messages with lower severity are written to console only:

```ts
logger.info('Good job!');
```

## Logging computation-intensive values

If logging a value requires significant processing, it is recommended to first check whether the logger is set to the
appropriate logging level:

```ts
import logger from 'pipit';

if (logger.isInfoEnabled) {
  // Obtain a heavily computed value
  const myHeavyValue = 'Hello';

  logger.info(myHeavyValue);
}
```
