"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerBlogModal = exports.generateThread = exports.publishBlog = exports.processBlogDraft = exports.slackEvents = void 0;
const https_1 = require("firebase-functions/v2/https");
// Slack setup
const slack_1 = require("./slack");
// Blog Workflow Handlers
const draft_pubsub_1 = require("./handlers/blog-workflow/draft.pubsub");
const publish_pubsub_1 = require("./handlers/blog-workflow/publish.pubsub");
const thread_handler_1 = require("./handlers/blog-workflow/thread.handler");
// === Export Firebase Functions ===
const config_1 = require("./config");
const secretsArray = [
    config_1.SLACK_BOT_TOKEN,
    config_1.SLACK_SIGNING_SECRET,
    config_1.GEMINI_API_KEY,
    config_1.OPENAI_API_KEY,
    config_1.WP_BASE_URL,
    config_1.WP_API_USER,
    config_1.WP_API_APP_PASSWORD,
    config_1.GOOGLE_SHEETS_CREDENTIALS,
    config_1.SPREADSHEET_ID,
    config_1.SLACK_CHANNEL_ID
];
// 1. Slack Events & Interactivity Webhook
// This handles all Slack Commands, Events, View Submissions, and Block Actions
exports.slackEvents = (0, https_1.onRequest)({ secrets: secretsArray }, (req, res) => {
    (0, slack_1.getSlackApp)(); // Ensure the App and its handlers are initialized and registered
    return (0, slack_1.getSlackReceiver)().app(req, res);
});
// 2. Background task consumers (Pub/Sub)
exports.processBlogDraft = (0, draft_pubsub_1.generateBlogDraftPubSub)(slack_1.getSlackApp);
exports.publishBlog = (0, publish_pubsub_1.publishBlogPubSub)(slack_1.getSlackApp);
// 3. Independent Webhook (e.g. for incoming Make.com triggers)
exports.generateThread = (0, thread_handler_1.threadWebhook)(slack_1.getSlackApp);
const config_2 = require("./config");
// 4. HTTP Endpoint to wake up the server and trigger the modal via a button click
exports.triggerBlogModal = (0, https_1.onRequest)({ secrets: secretsArray }, async (req, res) => {
    try {
        const slackApp = (0, slack_1.getSlackApp)();
        // Send a message to the blog channel with a button to open the modal
        await slackApp.client.chat.postMessage({
            token: config_2.config.slack.botToken,
            channel: config_2.config.slack.channelId,
            text: '블로그 포스팅 서버가 준비되었습니다.',
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "🚀 *Podo Korean 블로그 봇 서버가 활성화되었습니다.*\n아래 버튼을 눌러 초안 작성을 시작하세요."
                    }
                },
                {
                    type: "actions",
                    elements: [
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "✍️ 블로그 작성 시작",
                                emoji: true
                            },
                            style: "primary",
                            action_id: "open_blog_modal"
                        }
                    ]
                }
            ]
        });
        // Send HTML response that auto-closes
        res.status(200).send(`
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>서버 예열 완료</title>
                </head>
                <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; background-color: #f4f4f4;">
                    <div style="text-align: center; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h1 style="color: #2E7D32;">✅ 서버가 준비되었습니다!</h1>
                        <p style="font-size: 18px; color: #555;">슬랙 채널(blog)로 돌아가서 <strong>[블로그 작성 시작]</strong> 버튼을 눌러주세요.</p>
                        <script>
                            setTimeout(() => {
                                window.close();
                            }, 5000);
                        </script>
                    </div>
                </body>
            </html>
        `);
    }
    catch (e) {
        console.error('Error triggering modal button:', e);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});
//# sourceMappingURL=index.js.map