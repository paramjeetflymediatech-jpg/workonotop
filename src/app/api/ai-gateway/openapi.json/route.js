import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://workontap.com';

  const openApiSpec = {
    openapi: '3.1.0',
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
              description: 'Successful response returning SEO metadata',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SeoListResponse',
                  },
                },
              },
            },
          },
        },
        post: {
          operationId: 'updateSeoSetting',
          summary: 'Create or update SEO metadata for a page',
          description: 'Saves optimized meta title, meta description, keywords, canonical URLs, robots directives, OpenGraph tags, and location content to the WorkOnTap database.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SeoUpdateRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'SEO successfully updated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/StandardSuccessResponse',
                  },
                },
              },
            },
          },
        },
        patch: {
          operationId: 'patchSeoSetting',
          summary: 'Partially update SEO metadata or location content for a page',
          description: 'Safe partial update (PATCH): only updates fields passed in the request body, preserving existing fields.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SeoUpdateRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'SEO successfully updated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/StandardSuccessResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/ai-gateway/v1/services': {
        get: {
          operationId: 'getServices',
          summary: 'List services or get full details for a service',
          description: 'Fetch all services, filter by category or slug, or list available service categories.',
          parameters: [
            {
              name: 'slug',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Service slug (e.g. general-home-repairs, furniture-assembly-in-burnaby)',
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
              description: 'Search filter for services',
            },
          ],
          responses: {
            '200': {
              description: 'Services data response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ServiceListResponse',
                  },
                },
              },
            },
          },
        },
        post: {
          operationId: 'createOrUpdateService',
          summary: 'Create or update a service or location listing',
          description: 'Saves service catalog listings or localized landing pages with rich HTML description, use cases, pricing, custom headings, and SEO.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ServiceCreateUpdateRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Service created or updated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/StandardSuccessResponse',
                  },
                },
              },
            },
          },
        },
        patch: {
          operationId: 'patchService',
          summary: 'Partially update a service or localized landing page (safe PATCH)',
          description: 'Safe partial update (PATCH): only modifies specified fields (e.g. description, custom_heading, meta tags) while preserving all other fields.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ServiceCreateUpdateRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Service successfully patched',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/StandardSuccessResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/ai-gateway/v1/service-locations': {
        get: {
          operationId: 'getServiceLocations',
          summary: 'List service locations or get specific service location by slug/id',
          description: 'Fetch location-specific service pages (e.g. furniture-assembly-burnaby, plumbing-surrey) to inspect unique location descriptions, custom headings, and SEO.',
          parameters: [
            {
              name: 'slug',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Service location slug (e.g. furniture-assembly-burnaby or furniture-assembly-in-burnaby)',
            },
            {
              name: 'service_slug',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Filter by service slug (e.g. furniture-assembly, plumbing)',
            },
            {
              name: 'location_slug',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Filter by city/location slug (e.g. burnaby, surrey, richmond)',
            },
            {
              name: 'only_missing',
              in: 'query',
              required: false,
              schema: { type: 'boolean' },
              description: 'Set to true to find service location pages missing unique descriptions or SEO',
            },
            {
              name: 'search',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Search filter for location name or service title',
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
              description: 'Service locations data response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ServiceLocationListResponse',
                  },
                },
              },
            },
          },
        },
        post: {
          operationId: 'createOrUpdateServiceLocation',
          summary: 'Create or update unique content and SEO for a service location page',
          description: 'Saves unique location description (HTML supported), custom H1 heading, custom intro paragraph, and SEO metadata for a location page (e.g. /services/furniture-assembly-in-burnaby).',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ServiceLocationCreateUpdateRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Service location successfully created or updated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/StandardSuccessResponse',
                  },
                },
              },
            },
          },
        },
        patch: {
          operationId: 'patchServiceLocation',
          summary: 'Partially update unique content and SEO for a service location page (safe PATCH)',
          description: 'Safe partial update (PATCH): updates only provided fields for the location page, preserving all other existing fields.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ServiceLocationCreateUpdateRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Service location successfully patched',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/StandardSuccessResponse',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        SeoItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            page_name: { type: 'string' },
            meta_title: { type: ['string', 'null'] },
            meta_description: { type: ['string', 'null'] },
            keywords: { type: ['string', 'null'] },
            canonical_url: { type: ['string', 'null'] },
            robots: { type: ['string', 'null'] },
            og_title: { type: ['string', 'null'] },
            og_description: { type: ['string', 'null'] },
            og_image: { type: ['string', 'null'] },
            updated_at: { type: ['string', 'null'] },
          },
        },
        SeoListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            count: { type: 'integer' },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SeoItem',
              },
            },
          },
        },
        SeoUpdateRequest: {
          type: 'object',
          required: ['page_name'],
          properties: {
            page_name: {
              type: 'string',
              description: 'The page route, e.g. /services/general-home-repairs, /services/furniture-assembly-in-burnaby, or home',
            },
            description: {
              type: 'string',
              description: 'Optional rich HTML content / description to save for the page/location.',
            },
            custom_heading: {
              type: 'string',
              description: 'Custom H1 heading for the page (e.g. #1 Rated Furniture Assembly in Burnaby, BC).',
            },
            custom_intro: {
              type: 'string',
              description: 'Custom introductory paragraph for the page/location.',
            },
            location_name: {
              type: 'string',
              description: 'Location or City name (e.g. Burnaby, Surrey).',
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
              description: 'Comma-separated target keywords (e.g. "furniture assembly burnaby, handyman bc").',
            },
            canonical_url: {
              type: 'string',
              description: 'Full canonical URL (e.g. https://workontap.com/services/furniture-assembly-in-burnaby).',
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
            header_scripts: {
              type: 'string',
              description: 'Custom header scripts e.g. Google Analytics, Tag Manager, or schema markup.',
            },
            footer_scripts: {
              type: 'string',
              description: 'Custom footer scripts e.g. tracking scripts.',
            },
          },
        },
        ServiceItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            slug: { type: 'string' },
            category_id: { type: 'integer' },
            category_name: { type: ['string', 'null'] },
            short_description: { type: ['string', 'null'] },
            description: { type: ['string', 'null'] },
            use_cases: { type: ['string', 'null'] },
            base_price: { type: ['string', 'number', 'null'] },
            additional_price: { type: ['string', 'number', 'null'] },
            duration_minutes: { type: ['integer', 'null'] },
            skills: {
              type: 'array',
              items: { type: 'string' },
            },
            is_active: { type: 'integer' },
            meta_title: { type: ['string', 'null'] },
            meta_description: { type: ['string', 'null'] },
            keywords: { type: ['string', 'null'] },
          },
        },
        ServiceListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ServiceItem',
              },
            },
          },
        },
        ServiceCreateUpdateRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', description: 'Service title' },
            slug: { type: 'string', description: 'URL slug (kebab-case)' },
            category_id: { type: 'integer', description: 'Category ID' },
            short_description: { type: 'string', description: 'Brief 1-2 sentence overview' },
            description: { type: 'string', description: 'Full formatted HTML description with <h3>, <p>, <ul>, <li>' },
            custom_heading: { type: 'string', description: 'Custom H1 heading for localized service page' },
            custom_intro: { type: 'string', description: 'Custom intro paragraph for localized service page' },
            location_name: { type: 'string', description: 'Location/City name if updating localized page' },
            use_cases: { type: 'string', description: 'Comma-separated common use cases' },
            base_price: { type: 'string', description: 'Base price in CAD (e.g. 89.99)' },
            additional_price: { type: 'string', description: 'Additional hourly/unit rate' },
            duration_minutes: { type: 'integer', description: 'Estimated job duration in minutes' },
            skills: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of required skill names',
            },
            meta_title: { type: 'string', description: 'Meta title for this service page' },
            meta_description: { type: 'string', description: 'Meta description for this service page' },
            keywords: { type: 'string', description: 'Target keywords for this service' },
            canonical_url: { type: 'string', description: 'Canonical URL' },
            og_title: { type: 'string', description: 'OpenGraph title' },
            og_description: { type: 'string', description: 'OpenGraph description' },
            og_image: { type: 'string', description: 'OpenGraph image URL' },
            is_active: { type: 'integer', default: 1 },
          },
        },
        ServiceLocationItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            service_id: { type: 'integer' },
            service_name: { type: 'string' },
            service_slug: { type: 'string' },
            location_name: { type: 'string' },
            location_slug: { type: 'string' },
            slug: { type: 'string' },
            description: { type: ['string', 'null'], description: 'Unique location-specific HTML description' },
            custom_heading: { type: ['string', 'null'] },
            custom_intro: { type: ['string', 'null'] },
            meta_title: { type: ['string', 'null'] },
            meta_description: { type: ['string', 'null'] },
            keywords: { type: ['string', 'null'] },
            canonical_url: { type: ['string', 'null'] },
            og_title: { type: ['string', 'null'] },
            og_description: { type: ['string', 'null'] },
            og_image: { type: ['string', 'null'] },
            is_active: { type: 'integer' },
            updated_at: { type: ['string', 'null'] },
          },
        },
        ServiceLocationListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            total: { type: 'integer' },
            count: { type: 'integer' },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ServiceLocationItem',
              },
            },
          },
        },
        ServiceLocationCreateUpdateRequest: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'Service location slug (e.g. furniture-assembly-burnaby or furniture-assembly-in-burnaby)' },
            service_slug: { type: 'string', description: 'Base service slug (e.g. furniture-assembly)' },
            location_slug: { type: 'string', description: 'City/location slug (e.g. burnaby, surrey)' },
            location_name: { type: 'string', description: 'City/location name (e.g. Burnaby, Surrey)' },
            description: { type: 'string', description: 'Unique location-specific formatted HTML description with <h2>, <h3>, <p>, <ul>, <li>' },
            custom_heading: { type: 'string', description: 'Custom H1 heading (e.g. #1 Rated Furniture Assembly Pros in Burnaby, BC)' },
            custom_intro: { type: 'string', description: 'Custom intro paragraph for this location' },
            meta_title: { type: 'string', description: 'SEO Meta Title' },
            meta_description: { type: 'string', description: 'SEO Meta Description' },
            keywords: { type: 'string', description: 'SEO Keywords' },
            canonical_url: { type: 'string', description: 'Canonical URL' },
            og_title: { type: 'string', description: 'OpenGraph title for social media previews' },
            og_description: { type: 'string', description: 'OpenGraph description for social sharing' },
            og_image: { type: 'string', description: 'OpenGraph image URL' },
            is_active: { type: 'integer', default: 1 },
          },
        },
        StandardSuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
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

