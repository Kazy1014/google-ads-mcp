/**
 * Type definitions for Google Ads MCP Server
 */

export interface GoogleAdsConfig {
  clientId: string;
  clientSecret: string;
  developerToken: string;
  refreshToken: string;
  customerId: string;
  loginCustomerId?: string;
}

export interface KeywordPlanMetrics {
  keyword: string;
  avgMonthlySearches: number;
  competition: string;
  competitionIndex: number;
  lowTopOfPageBidMicros?: number;
  highTopOfPageBidMicros?: number;
  currency?: string;
}

export interface KeywordIdea {
  text: string;
  avgMonthlySearches: number;
  competition: string;
  competitionIndex: number;
}

export interface KeywordPlanRequest {
  keywords: string[];
  locationIds?: string[];
  languageId?: string;
  networkType?: 'GOOGLE_SEARCH' | 'GOOGLE_SEARCH_AND_PARTNERS';
}

export interface KeywordPlanResponse {
  metrics: KeywordPlanMetrics[];
  relatedKeywords?: KeywordIdea[];
}

export class GoogleAdsError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'GoogleAdsError';
  }
}

