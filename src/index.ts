#!/usr/bin/env node
/**
 * Google Ads MCP Server Entry Point
 */

import { ConfigLoader } from './config/ConfigLoader.js';
import { GoogleAdsClient } from './infrastructure/GoogleAdsClient.js';
import { KeywordPlannerService } from './domain/KeywordPlannerService.js';
import { KeywordPlannerUseCase } from './application/KeywordPlannerUseCase.js';
import { MCPServer } from './presentation/MCPServer.js';
import { GoogleAdsError } from './types/index.js';

// Suppress Node.js metadata lookup warnings
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name !== 'MetadataLookupWarning') {
    console.error(warning);
  }
});

async function main() {
  try {
    console.error('Starting Google Ads MCP Server...');
    
    // Load and validate configuration
    console.error('Loading configuration...');
    const config = ConfigLoader.loadFromEnvironment();
    ConfigLoader.validate(config);
    console.error('Configuration loaded successfully');

    // Initialize infrastructure layer
    console.error('Initializing Google Ads client...');
    const googleAdsClient = new GoogleAdsClient(config);
    
    // Test connection (skip if SKIP_CONNECTION_TEST is set)
    if (process.env.SKIP_CONNECTION_TEST !== 'true') {
      console.error('Testing Google Ads API connection...');
      try {
        await googleAdsClient.testConnection();
        console.error('✓ Connected to Google Ads API successfully');
      } catch (error) {
        console.error('⚠️  Connection test failed, but continuing anyway...');
        console.error('   (Keyword Planner may still work)');
        console.error('   Error:', error instanceof Error ? error.message : error);
      }
    } else {
      console.error('⚠️  Skipping connection test (SKIP_CONNECTION_TEST=true)');
    }

    // Initialize domain layer
    console.error('Initializing domain services...');
    const keywordPlannerService = new KeywordPlannerService(googleAdsClient);

    // Initialize application layer
    console.error('Initializing application layer...');
    const keywordPlannerUseCase = new KeywordPlannerUseCase(keywordPlannerService);

    // Initialize and start MCP server
    console.error('Initializing MCP server...');
    const mcpServer = new MCPServer(keywordPlannerUseCase);
    console.error('Starting MCP server transport...');
    await mcpServer.start();
  } catch (error) {
    console.error('Fatal error during server startup:');
    if (error instanceof GoogleAdsError) {
      console.error(`GoogleAdsError: ${error.message}`);
      if (error.details) {
        console.error('Details:', error.details);
      }
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

main();

