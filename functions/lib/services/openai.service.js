"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../config");
class OpenAIService {
    constructor() {
        this.openai = new openai_1.default({
            apiKey: config_1.config.ai.openaiKey,
        });
    }
    async generateImage(prompt) {
        var _a, _b;
        const response = await this.openai.images.generate({
            model: "dall-e-3",
            prompt: `A professional, photorealistic photograph representing ${prompt}. cinematic lighting, highly detailed, editorial style shot. Do not add any other text in the image.`,
            size: "1024x1024",
            quality: "standard",
            style: "natural",
            response_format: "b64_json"
        });
        const base64 = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.b64_json;
        if (!base64) {
            throw new Error('No image returned');
        }
        return Buffer.from(base64, 'base64');
    }
}
exports.OpenAIService = OpenAIService;
//# sourceMappingURL=openai.service.js.map