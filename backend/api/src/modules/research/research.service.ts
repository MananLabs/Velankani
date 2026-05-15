// ═══════════════════════════════════════════════════════════
// VEL AI — Research Service (Tavily Web Search)
// ═══════════════════════════════════════════════════════════

import { Injectable, Logger } from '@nestjs/common';
import { AIService } from '../ai/ai.service';

export interface ResearchResult {
  query: string;
  findings: string;
  sources: Array<{
    url: string;
    title: string;
    snippet: string;
  }>;
  tokensUsed: number;
  latencyMs: number;
}

@Injectable()
export class ResearchService {
  private readonly logger = new Logger(ResearchService.name);
  private readonly tavilyApiKey = process.env.TAVILY_API_KEY;
  private readonly perplexityApiKey = process.env.PERPLEXITY_API_KEY;

  constructor(private readonly aiService: AIService) {}

  async research(query: string): Promise<ResearchResult> {
    const startTime = Date.now();

    const sources: ResearchResult['sources'] = [];
    let webResults = '';

    if (this.tavilyApiKey) {
      const tavilyResults = await this.searchTavily(query);
      sources.push(...tavilyResults.sources);
      webResults = tavilyResults.content;
    } else if (this.perplexityApiKey) {
      const perplexityResults = await this.searchPerplexity(query);
      sources.push(...perplexityResults.sources);
      webResults = perplexityResults.content;
    } else {
      const mockResults = this.getMockResearch(query);
      sources.push(...mockResults.sources);
      webResults = mockResults.content;
    }

    const synthesisPrompt = `You are a research analyst. Based on the following web search results, provide a comprehensive research summary.

Query: "${query}"

Search Results:
${webResults}

Provide a structured analysis with:
1. **Key Findings** (3-5 bullet points)
2. **Detailed Analysis** (2-3 paragraphs)
3. **Data Points** (any specific numbers, dates, or facts mentioned)

Be factual, cite sources inline, and distinguish between verified information and claims needing further verification.`;

    const synthesisStream = this.aiService.createStream({
      model: 'glm-4-5-air',
      messages: [{ role: 'user', content: synthesisPrompt }],
      user: { id: 'research-agent', byokOpenaiKey: null, byokAnthropicKey: null },
      maxTokens: 2048,
    });

    let findings = '';
    for await (const chunk of synthesisStream) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      if (content) {
        findings += content;
      }
    }

    const latencyMs = Date.now() - startTime;
    const estimatedTokens = Math.floor(findings.length / 4);

    return {
      query,
      findings,
      sources,
      tokensUsed: estimatedTokens,
      latencyMs,
    };
  }

  private async searchTavily(query: string): Promise<{ content: string; sources: ResearchResult['sources'] }> {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.tavilyApiKey}`,
        },
        body: JSON.stringify({
          query,
          search_depth: 'advanced',
          max_results: 8,
          include_answer: true,
          include_raw_content: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status}`);
      }

      const data = await response.json() as {
        answer?: string;
        results: Array<{ url: string; title: string; content: string }>;
      };

      const sources: ResearchResult['sources'] = data.results.slice(0, 8).map((r) => ({
        url: r.url,
        title: r.title,
        snippet: r.content.slice(0, 200),
      }));

      const content = data.results
        .map((r) => `[${r.title}](${r.url}): ${r.content}`)
        .join('\n\n');

      return {
        content: data.answer ? `${data.answer}\n\n${content}` : content,
        sources,
      };
    } catch (err) {
      this.logger.error(`Tavily search failed: ${err}`);
      return this.getMockResearch(query);
    }
  }

  private async searchPerplexity(query: string): Promise<{ content: string; sources: ResearchResult['sources'] }> {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.perplexityApiKey}`,
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a research assistant. Search the web for information and provide factual, well-sourced answers.',
            },
            { role: 'user', content: query },
          ],
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json() as {
        choices: Array<{ message: { content: string } }>;
      };

      const sources: ResearchResult['sources'] = [];
      const content = data.choices[0]?.message?.content || '';

      const urlRegex = /https?:\/\/[^\s\)\]]+/g;
      const urls = content.match(urlRegex) || [];
      urls.slice(0, 8).forEach((url) => {
        sources.push({
          url,
          title: url.split('/').pop() || url,
          snippet: url,
        });
      });

      return { content, sources };
    } catch (err) {
      this.logger.error(`Perplexity search failed: ${err}`);
      return this.getMockResearch(query);
    }
  }

  private getMockResearch(query: string): { content: string; sources: ResearchResult['sources'] } {
    return {
      content: `Based on web research for "${query}", here are key findings:

**Emerging Trends:**
- Industry adoption is accelerating with 60% growth in the past 12 months
- Major players are investing heavily in infrastructure and tooling
- Regulatory frameworks are being developed to address emerging challenges

**Market Analysis:**
- Global market size estimated at $45B with projections to reach $120B by 2028
- Enterprise adoption leading consumer by 3:1 ratio
- Asia-Pacific region showing fastest growth at 85% YoY

**Key Considerations:**
- Security and privacy concerns remain primary adoption barriers
- Interoperability standards are still evolving
- Talent shortage continues to impact growth rates

Note: This is a simulated research result. Add TAVILY_API_KEY or PERPLEXITY_API_KEY for real web search.`,
      sources: [
        { url: 'https://arxiv.org', title: 'arXiv Papers', snippet: 'Academic research papers' },
        { url: 'https://scholar.google.com', title: 'Google Scholar', snippet: 'Peer-reviewed studies' },
        { url: 'https://hackernews.com', title: 'Hacker News', snippet: 'Industry discussions' },
        { url: 'https://techcrunch.com', title: 'TechCrunch', snippet: 'Tech industry news' },
      ],
    };
  }
}