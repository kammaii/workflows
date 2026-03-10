"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerActionHandlers = void 0;
const pubsub_1 = require("@google-cloud/pubsub");
const config_1 = require("../../config");
const pubSubClient = new pubsub_1.PubSub();
const registerActionHandlers = (app) => {
    // Handle "Start Final Step" Button
    app.action('start_final_step', async ({ ack, body, action, client }) => {
        await ack();
        // Safety check for button value
        if (action.type !== 'button' || !action.value)
            return;
        const postId = action.value;
        const targetChannel = config_1.config.slack.channelId;
        // Send acknowledgement
        await client.chat.postMessage({
            token: config_1.config.slack.botToken,
            channel: targetChannel,
            text: `🔄 ${postId}번 포스트 번역 및 퍼블리싱 작업을 시작합니다...`
        });
        // Publish to Pub/Sub for background processing
        const topicName = 'publish-final-blog';
        const data = JSON.stringify({
            postId: parseInt(postId, 10),
            channelId: targetChannel
        });
        try {
            await pubSubClient.topic(topicName).publishMessage({ data: Buffer.from(data) });
            console.log(`Published publish event to ${topicName}`);
        }
        catch (e) {
            console.error('Failed to publish to pub/sub', e);
        }
    });
};
exports.registerActionHandlers = registerActionHandlers;
//# sourceMappingURL=publish.handler.js.map