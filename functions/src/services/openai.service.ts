import OpenAI from 'openai';
import { config } from '../config';

export class OpenAIService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: config.ai.openaiKey,
        });
    }

    async generateImage(prompt: string): Promise<Buffer> {
        const response = await this.openai.images.generate({
            model: "dall-e-3",
            prompt: `A professional, photorealistic photograph representing ${prompt}. cinematic lighting, highly detailed, editorial style shot. Do not add any other text in the image.`,
            size: "1024x1024",
            quality: "standard",
            style: "natural",
            response_format: "b64_json"
        });

        const base64 = response.data?.[0]?.b64_json;
        if (!base64) {
            throw new Error('No image returned');
        }
        return Buffer.from(base64, 'base64');
    }
}
