"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordPressService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
class WordPressService {
    constructor() {
        const auth = Buffer.from(`${config_1.config.wordpress.apiUser}:${config_1.config.wordpress.appPassword}`).toString('base64');
        this.client = axios_1.default.create({
            baseURL: config_1.config.wordpress.baseUrl,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
    }
    async uploadMedia(buffer, filename) {
        const response = await this.client.post('/wp-json/wp/v2/media', buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename=${filename}`
            }
        });
        return response.data.id;
    }
    async getMediaUrl(mediaId) {
        const response = await this.client.get(`/wp-json/wp/v2/media/${mediaId}`);
        return response.data.source_url;
    }
    async createDraftPost(params) {
        const payload = {
            title: params.title,
            content: params.content,
            status: 'draft',
        };
        if (params.featuredMediaId) {
            payload.featured_media = params.featuredMediaId;
        }
        const response = await this.client.post('/wp-json/wp/v2/posts', payload);
        return response.data;
    }
    async getPost(postId) {
        const response = await this.client.get(`/wp-json/wp/v2/posts/${postId}`);
        return response.data;
    }
    async updatePost(postId, params) {
        const response = await this.client.post(`/wp-json/wp/v2/posts/${postId}`, {
            title: params.title,
            content: params.content,
            slug: params.slug,
            status: 'draft',
            categories: params.categories,
            meta: params.meta
        });
        return response.data;
    }
}
exports.WordPressService = WordPressService;
//# sourceMappingURL=wordpress.service.js.map