import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://workontap.com';

  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'WorkOnTap SEO & Catalog AI Gateway',
      description: 'API for ChatGPT and AI Agents to read, audit, generate, and update SEO metadata and service listings on WorkOnTap.',
      version: '1.0.0',
    },
    servers: [
      {
        url: baseUrl,
        description: 'Production Server',
      },
    ],
    security: [
      {
        BearerAuth: [],
      },
    ],
    paths: {
      '/api/ai-gateway/v1/seo': {
        get: {
          operationId: 'getSeoSettings',
          summary: 'List SEO settings or fetch SEO for a specific page',
          description: 'Use this tool to find existing SEO metadata, check for pages missing descriptions/titles, or inspect specific page tags.',
          parameters: [
            {
              name: 'page_name',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Exact page route (e.g. /services/general-home-repairs, home, or /blogs/summer-tips).',
            },
            {
              name: 'only_missing',
              in: 'query',
              required: false,
              schema: { type: 'boolean' },
              description: 'Set to true to find all pages that are missing meta titles or meta descriptions.',
            },
            {
              name: 'search',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Search filter for page names or titles.',
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 50 },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { type: 'object' } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          operationId: 'updateSeoSetting',
          summary: 'Create or update SEO metadata for a page',
          description: 'Saves optimized meta title, meta description, keywords, canonical URLs, robots directives, and OpenGraph tags to the WorkOnTap database.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['page_name'],
                  properties: {
                    page_name: {
                      type: 'string',
                      description: 'The page route, e.g. /services/general-home-repairs, /services/plumbing-vancouver, or home',
                    },
                    meta_title: {
                      type: 'string',
                      description: 'Optimal 50-60 char meta title for Google Search ranking.',
                    },
                    meta_description: {
                      type: 'string',
                      description: 'Optimal 145-160 char meta description with high-converting CTA.',
                    },
                    keywords: {
                      type: 'string',
                      description: 'Comma-separated target keywords (e.g. "home repairs vancouver, drywall patching, handyman bc").',
                    },
                    canonical_url: {
                      type: 'string',
                      description: 'Full canonical URL (e.g. https://workontap.com/services/general-home-repairs).',
                    },
                    robots: {
                      type: 'string',
                      default: 'index, follow',
                      description: 'Crawler directives (e.g. "index, follow" or "noindex, nofollow").',
                    },
                    og_title: {
                      type: 'string',
                      description: 'OpenGraph title for social media sharing.',
                    },
                    og_description: {
                      type: 'string',
                      description: 'OpenGraph description for social sharing.',
                    },
                    og_image: {
                      type: 'string',
                      description: 'Featured OpenGraph image URL.',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'SEO successfully updated',
            },
          },
        },
      },
      '/api/ai-gateway/v1/services': {
        get: {
          operationId: 'getServices',
          summary: 'List services or get full details for a service',
          parameters: [
            {
              name: 'slug',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Service slug (e.g. general-home-repairs)',
            },
            {
              name: 'categories',
              in: 'query',
              required: false,
              schema: { type: 'boolean' },
              description: 'Set to true to retrieve list of all available service categories.',
            },
            {
              name: 'search',
              in: 'query',
              required: false,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Services data',
            },
          },
        },
        post: {
          operationId: 'createOrUpdateService',
          summary: 'Create or update a service listing',
          description: 'Saves full service catalog listings with rich HTML description, use cases, pricing, and duration.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', description: 'Service title' },
                    slug: { type: 'string', description: 'URL slug (kebab-case)' },
                    category_id: { type: 'integer', description: 'Category ID' },
                    short_description: { type: 'string', description: 'Brief 1-2 sentence overview' },
                    description: { type: 'string', description: 'Full formatted HTML description with <h3>, <p>, <ul>, <li>' },
                    use_cases: { type: 'string', description: 'Comma-separated common use cases' },
                    base_price: { type: 'string', description: 'Base price in CAD (e.g. 89.99)' },
                    additional_price: { type: 'string', description: 'Additional hourly/unit rate' },
                    duration_minutes: { type: 'integer', description: 'Estimated job duration in minutes' },
                    skills: { type: 'array', items: { type: 'string' } },
                    is_active: { type: 'integer', default: 1 },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Service created or updated',
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API-Key',
          description: 'Enter your AI_GATEWAY_SECRET_KEY as Bearer Token',
        },
      },
    },
  };

  return NextResponse.json(openApiSpec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-KEY',
    },
  });
}
