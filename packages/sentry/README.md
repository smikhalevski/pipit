# Sentry processor for Pipit

Sends messages dispatched using [Pipit](https://github.com/smikhalevski/pipit#readme) to
[Sentry](https://sentry.io).

```sh
npm install --save-prod @pipit/sentry
```

# Usage example

```ts
import { logger } from 'pipit';
import { sendToSentry } from '@pipit/sentry';
import * as Sentry from '@sentry/browser';

logger.openChannel().to(sendToSentry(Sentry));

logger.log('To the moon!');
// Prints message to console and sends it to Sentry
```
