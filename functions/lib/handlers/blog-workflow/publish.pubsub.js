"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishBlogPubSub = void 0;
const pubsub_1 = require("firebase-functions/v2/pubsub");
const gemini_service_1 = require("../../services/gemini.service");
const wordpress_service_1 = require("../../services/wordpress.service");
const google_sheets_service_1 = require("../../services/google-sheets.service");
const config_1 = require("../../config");
let geminiService;
let wpService;
let sheetsService;
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
const publishBlogPubSub = (getSlackApp) => {
    return (0, pubsub_1.onMessagePublished)({ topic: 'publish-final-blog', secrets: secretsArray }, async (event) => {
        try {
            geminiService = geminiService || new gemini_service_1.GeminiService();
            wpService = wpService || new wordpress_service_1.WordPressService();
            sheetsService = sheetsService || new google_sheets_service_1.GoogleSheetsService();
            const slackApp = getSlackApp();
            const payload = event.data.message.json;
            const { postId, channelId } = payload;
            console.log(`Processing final publish for post: ${postId}`);
            // 1. Get current WordPress post content (The drafted Korean version)
            const post = await wpService.getPost(postId);
            const title = post.title.rendered;
            const content = post.content.rendered;
            // 2. Save Korean Draft to Google Sheets
            console.log('Appnding to Google Sheets...');
            try {
                await sheetsService.appendDraftRow({
                    spreadsheetId: config_1.config.sheets.spreadsheetId,
                    sheetName: '시트1',
                    postId,
                    title,
                    draftContent: content
                });
            }
            catch (e) {
                console.error('Failed to append to Google Sheets', e);
                // Continue event on sheets failure
            }
            // 3. Generate English Translation & SEO meta
            console.log('Generating English translation...');
            const finalContent = await geminiService.generateEnglishFinal(title, content);
            // 4. Update WordPress post with English translation
            const categoryMap = {
                "K-drama": 16,
                "Korean Culture": 10,
                "Korean Food": 14,
                "Korean History": 15,
                "Korean News": 12,
                "Learning Korean": 13,
                "Travel to Korea": 11
            };
            const categoryId = categoryMap[finalContent.category] || 13;
            console.log('Updating WordPress post...');
            await wpService.updatePost(postId, {
                title: finalContent.title,
                content: finalContent.content,
                slug: finalContent.rank_math_permalink,
                categories: [categoryId],
                meta: {
                    rank_math_focus_keyword: finalContent.rank_math_focus_keyword,
                    rank_math_title: finalContent.rank_math_title,
                    rank_math_description: finalContent.rank_math_description,
                    rank_math_permalink: finalContent.rank_math_permalink
                }
            });
            // 5. Notify Slack of success
            console.log('Notifying Slack...');
            await slackApp.client.chat.postMessage({
                token: config_1.config.slack.botToken,
                channel: channelId,
                text: '대표님, 블로그 후속 작업을 완료했습니다.'
            });
            console.log('Publish process completed.');
        }
        catch (error) {
            console.error('Error during publish process:', error);
        }
    });
};
exports.publishBlogPubSub = publishBlogPubSub;
//# sourceMappingURL=publish.pubsub.js.map