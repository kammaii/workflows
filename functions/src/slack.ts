import { App, ExpressReceiver } from '@slack/bolt';
import { config } from './config';

let receiver: ExpressReceiver;
let app: App;

export const getSlackReceiver = () => {
    if (!receiver) {
        receiver = new ExpressReceiver({
            signingSecret: config.slack.signingSecret as string,
            endpoints: '/',
            processBeforeResponse: true,
        });
    }
    return receiver;
};

import { registerModalHandlers } from './handlers/blog-workflow/modal.handler';
import { registerActionHandlers } from './handlers/blog-workflow/publish.handler';

export const getSlackApp = () => {
    if (!app) {
        app = new App({
            token: config.slack.botToken as string,
            receiver: getSlackReceiver(),
            processBeforeResponse: true,
        });
        registerModalHandlers(app);
        registerActionHandlers(app);
    }
    return app;
};
