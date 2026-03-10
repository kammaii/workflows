import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

export class GeminiService {
    private ai: GoogleGenerativeAI;

    constructor() {
        this.ai = new GoogleGenerativeAI(config.ai.geminiKey as string);
    }

    async generateKoreanDraft(title: string, body: string): Promise<{ title: string; content: string }> {
        const model = this.ai.getGenerativeModel({
            model: 'gemini-2.5-pro',
            generationConfig: {
                responseMimeType: 'application/json',
            }
        });

        const prompt = `당신은 한국어 교육 앱 'Podo Korean'을 운영하는 전문 한국어 교사이자 블로그 마케터입니다.
우리의 타겟 독자는 '한국어와 한국 문화를 배우고 싶어 하는 외국인'입니다.
최종적으로는 이 글을 영어로 번역하여 발행할 것이지만, 현재는 내용 검토를 위해 완벽한 논리를 갖춘 '한국어 초안'을 작성해야 합니다.

# 입력 정보
- 주제 (Target Topic): ${title}
- 참고 내용: ${body}

# 필수 작성 가이드 (Strict Guidelines)
1. **워드프레스 구텐베르크 블록 구조 준수**: 워드프레스에 붙여넣었을 때 '블록 복구'가 필요 없도록, 모든 요소는 구텐베르크 블록 포맷을 지켜야 합니다.
2. **이미지 위치 지정**: 서론이 끝나는 문단 블록과 첫 번째 소제목 블록 사이의 빈 공간에 반드시 [[IMAGE]] 텍스트만 단독으로 삽입해 주세요. (주석으로 감싸지 마세요.)
3. **분량**: 공백 포함 3,000자 이상 아주 자세하게 작성.
4. **아주 자연스러운 맥락 속 Podo Korean 홍보 포함**.
5. **SEO를 고려한 논리 구조**: Body는 3~4개의 H2 소제목, Conclusion에 앱 다운로드 유도(CTA) 포함.
6. **첫 인사말**: "Podo Korean의 전문 한국어 교사 Danny"라고 자신을 소개하는 따뜻한 인사말로 시작해야 합니다.

# 블록 작성 포맷 예시:
<!-- wp:paragraph -->
<p>내용...</p>
<!-- /wp:paragraph -->
<!-- wp:heading -->
<h2 class="wp-block-heading">소제목...</h2>
<!-- /wp:heading -->

# 출력 형식 (JSON ONLY)
{
  "title": "영어 제목",
  "content": "한국어 내용 (위에서 요구한 HTML/Gutenberg 규칙 적용)"
}
`;
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        return JSON.parse(text);
    }

    async generateEnglishFinal(title: string, content: string): Promise<any> {
        const model = this.ai.getGenerativeModel({
            model: 'gemini-2.5-pro',
            generationConfig: {
                responseMimeType: 'application/json',
            }
        });

        const prompt = `You are a professional translator and SEO specialist.
Translate the provided Korean content into English while formatting for WordPress Gutenberg blocks.

# Input Data
- Title: ${title}
- Content: ${content}

# CRITICAL FORMATTING RULES (Gutenberg Blocks)
Keep Gutenberg block comments like <!-- wp:paragraph -->.
1. Bilingual Examples (CRITICAL): Keep Korean text and add English translation in parentheses. Format: [Korean] ([English])
2. Replace [[IMAGE]] with the actual image block if there are images, or keep the existing image tag wrapped properly.
3. If Podo Korean is mentioned, hyperlink it: <a href="https://podokorean.com/apps" target="_blank" rel="noopener">Podo Korean</a>

# SEO Instructions
Choose one category: K-drama, Korean Culture, Korean Food, Korean History, Korean News, Learning Korean, Travel to Korea.
Generate exactly 5 Rank Math SEO keywords (1 Main, 4 Secondary).

# Output Format (JSON ONLY)
{
  "title": "English Title",
  "content": "Translated Gutenberg formatted content...",
  "category": "Selected Category Name",
  "rank_math_focus_keyword": "Main, Sec1, Sec2, Sec3, Sec4",
  "rank_math_title": "SEO Title (Max 60 chars)",
  "rank_math_description": "Meta Description (Max 160 chars)",
  "rank_math_permalink": "english-slug"
}`;

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        return JSON.parse(text);
    }

    async generateThreads(title: string, content: string, link: string): Promise<{ threads: Array<{ english: string; korean: string }> }> {
        const model = this.ai.getGenerativeModel({
            model: 'gemini-2.5-pro',
            generationConfig: {
                responseMimeType: 'application/json',
            }
        });

        const prompt = `You are a helpful local friend living in Korea. 
Write 3-5 thread posts based on the blog.

# Input Data
- Title: ${title}
- Content: ${content}
- Blog URL: ${link}

# Output Format (JSON ONLY)
{
  "threads": [
    {
      "english": "English text...",
      "korean": "한국어 요약..."
    }
  ]
}
`;
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        return JSON.parse(text);
    }
}
