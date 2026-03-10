import { onRequest } from 'firebase-functions/v2/https';

// Slack setup
import { getSlackApp, getSlackReceiver } from './slack';

// Blog Workflow Handlers
import { generateBlogDraftPubSub } from './handlers/blog-workflow/draft.pubsub';
import { publishBlogPubSub } from './handlers/blog-workflow/publish.pubsub';
import { threadWebhook } from './handlers/blog-workflow/thread.handler';

// === Export Firebase Functions ===

import {
    SLACK_BOT_TOKEN,
    SLACK_SIGNING_SECRET,
    GEMINI_API_KEY,
    OPENAI_API_KEY,
    WP_BASE_URL,
    WP_API_USER,
    WP_API_APP_PASSWORD,
    GOOGLE_SHEETS_CREDENTIALS,
    SPREADSHEET_ID,
    SLACK_CHANNEL_ID
} from './config';

const secretsArray = [
    SLACK_BOT_TOKEN,
    SLACK_SIGNING_SECRET,
    GEMINI_API_KEY,
    OPENAI_API_KEY,
    WP_BASE_URL,
    WP_API_USER,
    WP_API_APP_PASSWORD,
    GOOGLE_SHEETS_CREDENTIALS,
    SPREADSHEET_ID,
    SLACK_CHANNEL_ID
];

// 1. Slack Events & Interactivity Webhook
// This handles all Slack Commands, Events, View Submissions, and Block Actions
export const slackEvents = onRequest({ secrets: secretsArray }, (req, res) => {
    getSlackApp(); // Ensure the App and its handlers are initialized and registered
    return getSlackReceiver().app(req, res);
});

// 2. Background task consumers (Pub/Sub)
export const processBlogDraft = generateBlogDraftPubSub(getSlackApp);
export const publishBlog = publishBlogPubSub(getSlackApp);

// 3. Independent Webhook (e.g. for incoming Make.com triggers)
export const generateThread = threadWebhook(getSlackApp);

import { config } from './config';

// 4. HTTP Endpoint to wake up the server and trigger the modal via a button click
export const triggerBlogModal = onRequest({ secrets: secretsArray }, async (req, res) => {
    try {
        const slackApp = getSlackApp();

        // Send a message to the blog channel with a button to open the modal
        await slackApp.client.chat.postMessage({
            token: config.slack.botToken as string,
            channel: config.slack.channelId as string,
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
    } catch (e) {
        console.error('Error triggering modal button:', e);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});
