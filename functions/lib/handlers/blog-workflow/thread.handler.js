"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.threadWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const gemini_service_1 = require("../../services/gemini.service");
const config_1 = require("../../config");
let geminiService;
const config_2 = require("../../config");
const secretsArray = [
    config_2.SLACK_BOT_TOKEN,
    config_2.SLACK_SIGNING_SECRET,
    config_2.GEMINI_API_KEY,
    config_2.OPENAI_API_KEY,
    config_2.WP_BASE_URL,
    config_2.WP_API_USER,
    config_2.WP_API_APP_PASSWORD,
    config_2.GOOGLE_SHEETS_CREDENTIALS,
    config_2.SPREADSHEET_ID,
    config_2.SLACK_CHANNEL_ID
];
const threadWebhook = (getSlackApp) => {
    return (0, https_1.onRequest)({ secrets: secretsArray }, async (req, res) => {
        try {
            geminiService = geminiService || new gemini_service_1.GeminiService();
            const slackApp = getSlackApp();
            if (req.method !== 'POST') {
                res.status(405).send('Method Not Allowed');
                return;
            }
            const { title, content, link } = req.body;
            if (!title || !content || !link) {
                res.status(400).send('Missing required body parameters (title, content, link)');
                return;
            }
            console.log(`Generating threads for: ${title}`);
            // 1. Generate Threads content
            const threadResult = await geminiService.generateThreads(title, content, link);
            const threads = threadResult.threads || [];
            // 2. Build Slack Blocks
            const blocks = [
                {
                    type: "header",
                    text: { type: "plain_text", text: "🧵 쓰레드 초안", emoji: true }
                },
                {
                    type: "section",
                    text: { type: "mrkdwn", text: "대표님, 검토 부탁드립니다." }
                },
                { type: "divider" }
            ];
            threads.forEach((item, index) => {
                let engText = item.english.replace('[[LINK]]', link);
                engText = engText.replace(/\*\*/g, "").replace(/\*/g, "");
                const urlEncoded = encodeURIComponent(engText.trim());
                const url = `https://www.threads.net/intent/post?text=${urlEncoded}`;
                blocks.push({
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*📌 ${index + 1}번 스레드 (한국어 요약)*\n> ${item.korean}`
                    }
                });
                blocks.push({
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `👇 *아래 영문을 복사하세요:*\n\`\`\`${engText}\`\`\``
                    }
                });
                if (index === 0) {
                    blocks.push({
                        type: "actions",
                        elements: [
                            {
                                type: "button",
                                text: { type: "plain_text", text: "📝 작성창 띄우기", emoji: true },
                                style: "primary",
                                url: url
                            }
                        ]
                    });
                }
                else {
                    blocks.push({
                        type: "context",
                        elements: [
                            { type: "mrkdwn", text: "↳ 위 텍스트를 복사해서 *이전 글의 답글*로 붙여넣으세요." }
                        ]
                    });
                }
                blocks.push({ type: "divider" });
            });
            // 3. Send Slack Message
            await slackApp.client.chat.postMessage({
                token: config_1.config.slack.botToken,
                // Unified target channel from config
                channel: config_1.config.slack.channelId,
                text: '대표님, 인스타그램 초안입니다.',
                blocks
            });
            res.status(200).send('Thread draft generated and sent to Slack.');
        }
        catch (error) {
            console.error('Error in threadWebhook:', error);
            res.status(500).send('Internal Server Error');
        }
    });
};
exports.threadWebhook = threadWebhook;
//# sourceMappingURL=thread.handler.js.map