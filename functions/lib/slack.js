"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSlackApp = exports.getSlackReceiver = void 0;
const bolt_1 = require("@slack/bolt");
const config_1 = require("./config");
let receiver;
let app;
const getSlackReceiver = () => {
    if (!receiver) {
        receiver = new bolt_1.ExpressReceiver({
            signingSecret: config_1.config.slack.signingSecret,
            endpoints: '/',
            processBeforeResponse: true,
        });
    }
    return receiver;
};
exports.getSlackReceiver = getSlackReceiver;
const modal_handler_1 = require("./handlers/blog-workflow/modal.handler");
const publish_handler_1 = require("./handlers/blog-workflow/publish.handler");
const getSlackApp = () => {
    if (!app) {
        app = new bolt_1.App({
            token: config_1.config.slack.botToken,
            receiver: (0, exports.getSlackReceiver)(),
            processBeforeResponse: true,
        });
        (0, modal_handler_1.registerModalHandlers)(app);
        (0, publish_handler_1.registerActionHandlers)(app);
    }
    return app;
};
exports.getSlackApp = getSlackApp;
//# sourceMappingURL=slack.js.map