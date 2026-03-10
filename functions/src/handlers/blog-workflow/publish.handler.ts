import { App } from '@slack/bolt';
import { PubSub } from '@google-cloud/pubsub';
import { config } from '../../config';

const pubSubClient = new PubSub();

export const registerActionHandlers = (app: App) => {
    // Handle "Start Final Step" Button
    app.action('start_final_step', async ({ ack, body, action, client }) => {
        await ack();

        // Safety check for button value
        if (action.type !== 'button' || !action.value) return;

        const postId = action.value;
        const targetChannel = config.slack.channelId as string;

        // Send acknowledgement
        await client.chat.postMessage({
            token: config.slack.botToken as string,
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
        } catch (e) {
            console.error('Failed to publish to pub/sub', e);
        }
    });
};
