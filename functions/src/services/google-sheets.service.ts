import { google } from 'googleapis';
import { config } from '../config';

export class GoogleSheetsService {
    private async getAuthClient() {
        const credentialsStr = config.sheets.credentials as string;
        if (!credentialsStr) {
            throw new Error('No Google Sheets credentials provided in environment.');
        }
        const credentials = JSON.parse(credentialsStr);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        return auth.getClient();
    }

    async appendDraftRow(params: {
        spreadsheetId: string;
        sheetName: string;
        postId: number;
        title: string;
        draftContent: string;
    }) {
        const authClient = await this.getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient as any });

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
