"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.SLACK_CHANNEL_ID = exports.SPREADSHEET_ID = exports.GOOGLE_SHEETS_CREDENTIALS = exports.WP_API_APP_PASSWORD = exports.WP_API_USER = exports.WP_BASE_URL = exports.OPENAI_API_KEY = exports.GEMINI_API_KEY = exports.SLACK_SIGNING_SECRET = exports.SLACK_BOT_TOKEN = void 0;
const dotenv = __importStar(require("dotenv"));
const params_1 = require("firebase-functions/params");
// Note: For local development using the emulator, place a .env file in the functions folder.
// For production deploy, you can use Secret Manager or defineSecret.
dotenv.config();
// Definitions for Firebase Secret Manager (V2 functions)
exports.SLACK_BOT_TOKEN = (0, params_1.defineSecret)('SLACK_BOT_TOKEN');
exports.SLACK_SIGNING_SECRET = (0, params_1.defineSecret)('SLACK_SIGNING_SECRET');
exports.GEMINI_API_KEY = (0, params_1.defineSecret)('GEMINI_API_KEY');
exports.OPENAI_API_KEY = (0, params_1.defineSecret)('OPENAI_API_KEY');
exports.WP_BASE_URL = (0, params_1.defineSecret)('WP_BASE_URL'); // e.g., https://podokorean.com
exports.WP_API_USER = (0, params_1.defineSecret)('WP_API_USER');
exports.WP_API_APP_PASSWORD = (0, params_1.defineSecret)('WP_API_APP_PASSWORD');
exports.GOOGLE_SHEETS_CREDENTIALS = (0, params_1.defineSecret)('GOOGLE_SHEETS_CREDENTIALS');
exports.SPREADSHEET_ID = (0, params_1.defineSecret)('SPREADSHEET_ID');
exports.SLACK_CHANNEL_ID = (0, params_1.defineSecret)('SLACK_CHANNEL_ID');
exports.config = {
    slack: {
        get botToken() { return process.env.SLACK_BOT_TOKEN || exports.SLACK_BOT_TOKEN.value(); },
        get signingSecret() { return process.env.SLACK_SIGNING_SECRET || exports.SLACK_SIGNING_SECRET.value(); },
        get channelId() { return process.env.SLACK_CHANNEL_ID || exports.SLACK_CHANNEL_ID.value(); },
    },
    ai: {
        get geminiKey() { return process.env.GEMINI_API_KEY || exports.GEMINI_API_KEY.value(); },
        get openaiKey() { return process.env.OPENAI_API_KEY || exports.OPENAI_API_KEY.value(); },
    },
    wordpress: {
        get baseUrl() { return process.env.WP_BASE_URL || exports.WP_BASE_URL.value(); },
        get apiUser() { return process.env.WP_API_USER || exports.WP_API_USER.value(); },
        get appPassword() { return process.env.WP_API_APP_PASSWORD || exports.WP_API_APP_PASSWORD.value(); },
    },
    sheets: {
        get credentials() { return process.env.GOOGLE_SHEETS_CREDENTIALS || exports.GOOGLE_SHEETS_CREDENTIALS.value(); },
        get spreadsheetId() { return process.env.SPREADSHEET_ID || exports.SPREADSHEET_ID.value(); },
    }
};
//# sourceMappingURL=index.js.map