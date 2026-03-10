import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { GeminiService } from '../../services/gemini.service';
import { WordPressService } from '../../services/wordpress.service';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { App } from '@slack/bolt';
import { config } from '../../config';

let geminiService: GeminiService;
let wpService: WordPressService;
let sheetsService: GoogleSheetsService;

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
} from '../../config';

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

export const publishBlogPubSub = (getSlackApp: () => App) => {
    return onMessagePublished({ topic: 'publish-final-blog', secrets: secretsArray }, async (event) => {
        try {
            geminiService = geminiService || new GeminiService();
            wpService = wpService || new WordPressService();
            sheetsService = sheetsService || new GoogleSheetsService();

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
                    spreadsheetId: config.sheets.spreadsheetId as string,
                    sheetName: '시트1',
                    postId,
                    title,
                    draftContent: content
                });
            } catch (e) {
                console.error('Failed to append to Google Sheets', e);
                // Continue event on sheets failure
            }

            // 3. Generate English Translation & SEO meta
            console.log('Generating English translation...');
            const finalContent = await geminiService.generateEnglishFinal(title, content);

            // 4. Update WordPress post with English translation
            const categoryMap: { [key: string]: number } = {
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
                token: config.slack.botToken as string,
                channel: channelId,
                text: '대표님, 블로그 후속 작업을 완료했습니다.'
            });

            console.log('Publish process completed.');
        } catch (error) {
            console.error('Error during publish process:', error);
        }
    });
};
