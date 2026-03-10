import * as dotenv from 'dotenv';
import { defineSecret } from 'firebase-functions/params';

// Note: For local development using the emulator, place a .env file in the functions folder.
// For production deploy, you can use Secret Manager or defineSecret.
dotenv.config();

// Definitions for Firebase Secret Manager (V2 functions)
export const SLACK_BOT_TOKEN = defineSecret('SLACK_BOT_TOKEN');
export const SLACK_SIGNING_SECRET = defineSecret('SLACK_SIGNING_SECRET');
export const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
export const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');
export const WP_BASE_URL = defineSecret('WP_BASE_URL'); // e.g., https://podokorean.com
export const WP_API_USER = defineSecret('WP_API_USER');
export const WP_API_APP_PASSWORD = defineSecret('WP_API_APP_PASSWORD');
export const GOOGLE_SHEETS_CREDENTIALS = defineSecret('GOOGLE_SHEETS_CREDENTIALS');
export const SPREADSHEET_ID = defineSecret('SPREADSHEET_ID');

export const SLACK_CHANNEL_ID = defineSecret('SLACK_CHANNEL_ID');

export const config = {
    slack: {
        get botToken() { return process.env.SLACK_BOT_TOKEN || SLACK_BOT_TOKEN.value(); },
        get signingSecret() { return process.env.SLACK_SIGNING_SECRET || SLACK_SIGNING_SECRET.value(); },
        get channelId() { return process.env.SLACK_CHANNEL_ID || SLACK_CHANNEL_ID.value(); },
    },
    ai: {
        get geminiKey() { return process.env.GEMINI_API_KEY || GEMINI_API_KEY.value(); },
        get openaiKey() { return process.env.OPENAI_API_KEY || OPENAI_API_KEY.value(); },
    },
    wordpress: {
        get baseUrl() { return process.env.WP_BASE_URL || WP_BASE_URL.value(); },
        get apiUser() { return process.env.WP_API_USER || WP_API_USER.value(); },
        get appPassword() { return process.env.WP_API_APP_PASSWORD || WP_API_APP_PASSWORD.value(); },
    },
    sheets: {
        get credentials() { return process.env.GOOGLE_SHEETS_CREDENTIALS || GOOGLE_SHEETS_CREDENTIALS.value(); },
        get spreadsheetId() { return process.env.SPREADSHEET_ID || SPREADSHEET_ID.value(); },
    }
};
