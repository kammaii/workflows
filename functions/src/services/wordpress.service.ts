import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

export class WordPressService {
    private client: AxiosInstance;

    constructor() {
        const auth = Buffer.from(`${config.wordpress.apiUser}:${config.wordpress.appPassword}`).toString('base64');
        this.client = axios.create({
            baseURL: config.wordpress.baseUrl,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async uploadMedia(buffer: Buffer, filename: string): Promise<number> {
        const response = await this.client.post('/wp-json/wp/v2/media', buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename=${filename}`
            }
        });
        return response.data.id;
    }

    async getMediaUrl(mediaId: number): Promise<string> {
        const response = await this.client.get(`/wp-json/wp/v2/media/${mediaId}`);
        return response.data.source_url;
    }

    async createDraftPost(params: { title: string, content: string, featuredMediaId?: number }): Promise<any> {
        const payload: any = {
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

    async getPost(postId: number): Promise<any> {
        const response = await this.client.get(`/wp-json/wp/v2/posts/${postId}`);
        return response.data;
    }

    async updatePost(postId: number, params: {
        title: string;
        content: string;
        slug: string;
        categories: number[];
        meta: any;
    }): Promise<any> {
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
