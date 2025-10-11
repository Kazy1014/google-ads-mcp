/**
 * MCP Server Presentation Layer
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import type { KeywordPlannerUseCase } from '../application/KeywordPlannerUseCase.js';
import { GoogleAdsError } from '../types/index.js';

export class MCPServer {
  private server: Server;

  constructor(private keywordPlannerUseCase: KeywordPlannerUseCase) {
    this.server = new Server(
      {
        name: 'google-ads-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'analyze_global_keyword_interest',
          description:
            'Analyze global interest and search volume for specified keywords using Google Ads Keyword Planner. Returns monthly search volumes, competition levels, and trends.',
          inputSchema: {
            type: 'object',
            properties: {
              keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of keywords to analyze (e.g., ["AI", "machine learning"])',
              },
            },
            required: ['keywords'],
          },
        },
        {
          name: 'analyze_keywords_by_location',
          description:
            'Analyze keyword interest for specific geographic locations. Useful for regional marketing analysis.',
          inputSchema: {
            type: 'object',
            properties: {
              keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of keywords to analyze',
              },
              locationIds: {
                type: 'array',
                items: { type: 'string' },
                description:
                  'Google Ads location IDs (e.g., ["2392"] for Japan, ["2840"] for US)',
              },
            },
            required: ['keywords', 'locationIds'],
          },
        },
        {
          name: 'get_detailed_keyword_plan',
          description:
            'Get comprehensive keyword plan including related keywords and suggestions. Perfect for content planning and SEO strategy.',
          inputSchema: {
            type: 'object',
            properties: {
              keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'Seed keywords to generate plan from',
              },
            },
            required: ['keywords'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'analyze_global_keyword_interest': {
            if (!args || !Array.isArray(args.keywords)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'keywords must be an array of strings'
              );
            }

            const result = await this.keywordPlannerUseCase.analyzeGlobalInterest(
              args.keywords
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'analyze_keywords_by_location': {
            if (
              !args ||
              !Array.isArray(args.keywords) ||
              !Array.isArray(args.locationIds)
            ) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'keywords and locationIds must be arrays'
              );
            }

            const result = await this.keywordPlannerUseCase.analyzeKeywordsByLocation(
              args.keywords,
              args.locationIds
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'get_detailed_keyword_plan': {
            if (!args || !Array.isArray(args.keywords)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'keywords must be an array of strings'
              );
            }

            const result = await this.keywordPlannerUseCase.getDetailedKeywordPlan(
              args.keywords
            );

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        if (error instanceof GoogleAdsError) {
          throw new McpError(
            ErrorCode.InternalError,
            `Google Ads API Error: ${error.message}`,
            error.details
          );
        }

        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('Google Ads MCP Server running on stdio');
  }
}

