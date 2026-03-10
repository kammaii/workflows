"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetsService = void 0;
const googleapis_1 = require("googleapis");
const config_1 = require("../config");
class GoogleSheetsService {
    async getAuthClient() {
        const credentialsStr = config_1.config.sheets.credentials;
        if (!credentialsStr) {
            throw new Error('No Google Sheets credentials provided in environment.');
        }
        const credentials = JSON.parse(credentialsStr);
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        return auth.getClient();
    }
    async appendDraftRow(params) {
        const authClient = await this.getAuthClient();
        const sheets = googleapis_1.google.sheets({ version: 'v4', auth: authClient });
        const values = [
            [
                new Date().toISOString(),
                params.postId.toString(),
                params.title,
                params.draftContent,
            ]
        ];
        await sheets.spreadsheets.values.append({
            spreadsheetId: params.spreadsheetId,
            range: params.sheetName,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });
    }
}
exports.GoogleSheetsService = GoogleSheetsService;
//# sourceMappingURL=google-sheets.service.js.map