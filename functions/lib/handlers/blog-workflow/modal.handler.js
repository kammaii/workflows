"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerModalHandlers = void 0;
const pubsub_1 = require("@google-cloud/pubsub");
const pubSubClient = new pubsub_1.PubSub();
const blogDraftModalView = {
    type: 'modal',
    callback_id: 'blog_draft_modal',
    title: { type: 'plain_text', text: '블로그 초안 작성', emoji: true },
    submit: { type: 'plain_text', text: '초안 제출' },
    blocks: [
        {
            type: 'input',
            block_id: 'title_block',
            label: { type: 'plain_text', text: '블로그 제목' },
            element: {
                type: 'plain_text_input',
                action_id: 'title_input',
                placeholder: { type: 'plain_text', text: '포스팅 제목을 입력하세요.' }
            }
        },
        {
            type: 'input',
            block_id: 'body_block',
            label: { type: 'plain_text', text: '초안 본문 내용' },
            element: {
                type: 'plain_text_input',
                action_id: 'body_input',
                multiline: true
            }
        },
        {
            type: 'input',
            block_id: 'image_option_block',
            optional: true,
            label: { type: 'plain_text', text: '옵션 설정' },
            element: {
                type: 'checkboxes',
                action_id: 'image_generation_checkbox',
                options: [
                    {
                        text: { type: 'plain_text', text: '이미지 생성 (DALL-E 3)' },
                        value: 'generate_image'
                    }
                ]
            }
        }
    ]
};
const registerModalHandlers = (app) => {
    // Helper command to open the modal (still works if server is warm)
    app.command('/blog', async ({ ack, body, client }) => {
        console.log('Received /blog command', { user: body.user_id, trigger_id: body.trigger_id });
        await ack();
        try {
            await client.views.open({
                trigger_id: body.trigger_id,
                view: blogDraftModalView
            });
        }
        catch (error) {
            console.error('Error opening Slack modal from command:', error);
        }
    });
    // Handle button click from the trigger URL
    app.action('open_blog_modal', async ({ ack, body, client }) => {
        console.log('Received open_blog_modal action', { user: body.user.id });
        await ack();
        try {
            await client.views.open({
                trigger_id: body.trigger_id,
                view: blogDraftModalView
            });
        }
        catch (error) {
            console.error('Error opening Slack modal from action:', error);
        }
    });
    // Handle Modal Submission
    app.view('blog_draft_modal', async ({ ack, body, view }) => {
        var _a, _b, _c, _d, _e, _f;
        console.log('Received modal submission', {
            user: body.user.id,
            view_id: view.id,
            callback_id: view.callback_id
        });
        // Acknowledge the modal submission immediately
        await ack();
        try {
            // Safe extraction of values
            const values = view.state.values;
            const title = (_b = (_a = values.title_block) === null || _a === void 0 ? void 0 : _a.title_input) === null || _b === void 0 ? void 0 : _b.value;
            const content = (_d = (_c = values.body_block) === null || _c === void 0 ? void 0 : _c.body_input) === null || _d === void 0 ? void 0 : _d.value;
            const imageOptions = ((_f = (_e = values.image_option_block) === null || _e === void 0 ? void 0 : _e.image_generation_checkbox) === null || _f === void 0 ? void 0 : _f.selected_options) || [];
            const generateImage = imageOptions.length > 0;
            const userId = body.user.id;
            console.log('Extracted values from modal', {
                title,
                contentLength: content === null || content === void 0 ? void 0 : content.length,
                generateImage
            });
            if (!title || !content) {
                console.warn('Missing title or content in modal submission');
                return;
            }
            // Publish to Pub/Sub for background processing to avoid Slack 3s timeout
            const topicName = 'generate-blog-draft';
            const data = JSON.stringify({
                title,
                content,
                generateImage,
                userId
            });
            await pubSubClient.topic(topicName).publishMessage({ data: Buffer.from(data) });
            console.log(`Successfully published message to ${topicName}`);
        }
        catch (e) {
            console.error('Failed to process modal submission or publish to pub/sub', e);
        }
    });
};
exports.registerModalHandlers = registerModalHandlers;
//# sourceMappingURL=modal.handler.js.map