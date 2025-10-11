/**
 * Keyword Planner Service Domain Layer
 */

import type { GoogleAdsClient } from '../infrastructure/GoogleAdsClient.js';
import type {
  KeywordPlanRequest,
  KeywordPlanResponse,
  KeywordPlanMetrics,
  KeywordIdea,
} from '../types/index.js';
import { GoogleAdsError } from '../types/index.js';
import { enums } from 'google-ads-api';

export class KeywordPlannerService {
  constructor(private googleAdsClient: GoogleAdsClient) {}

  /**
   * Get keyword metrics and ideas for specified keywords
   * Includes global search volume and competition data
   */
  async getKeywordMetrics(
    request: KeywordPlanRequest
  ): Promise<KeywordPlanResponse> {
    try {
      const customer = this.googleAdsClient.getCustomer();
      
      // Default to worldwide (location_id: 2840 = United States, but we'll use global aggregate)
      // For truly global data, we'll aggregate from multiple locations or use null
      const locationIds = request.locationIds || [];
      
      // Default to English
      const languageId = request.languageId || '1000'; // English
      
      // Build location resource names
      const geoTargetConstants = locationIds.map(
        (id) => `geoTargetConstants/${id}`
      );

      // Generate keyword ideas and get metrics
      const requestParams: any = {
        customer_id: this.googleAdsClient.getCustomerId(),
        language: `languageConstants/${languageId}`,
        include_adult_keywords: false,
        keyword_plan_network: request.networkType 
          ? enums.KeywordPlanNetwork[request.networkType]
          : enums.KeywordPlanNetwork.GOOGLE_SEARCH,
        keyword_seed: {
          keywords: request.keywords,
        },
      };

      // Only add geo_target_constants if not empty
      if (geoTargetConstants.length > 0) {
        requestParams.geo_target_constants = geoTargetConstants;
      }

      const response = await customer.keywordPlanIdeas.generateKeywordIdeas(requestParams);

      const metrics: KeywordPlanMetrics[] = [];
      const relatedKeywords: KeywordIdea[] = [];

      // Response is an object with results array
      const results = Array.isArray(response) ? response : (response.results || []);

      for (const result of results) {
        const keywordText = result.text || '';
        const keywordMetrics = result.keyword_idea_metrics;

        if (!keywordMetrics) continue;

        const metricData: KeywordPlanMetrics = {
          keyword: keywordText,
          avgMonthlySearches: Number(keywordMetrics.avg_monthly_searches || 0),
          competition: this.getCompetitionLevel(keywordMetrics.competition),
          competitionIndex: Number(keywordMetrics.competition_index || 0),
          lowTopOfPageBidMicros: keywordMetrics.low_top_of_page_bid_micros
            ? Number(keywordMetrics.low_top_of_page_bid_micros)
            : undefined,
          highTopOfPageBidMicros: keywordMetrics.high_top_of_page_bid_micros
            ? Number(keywordMetrics.high_top_of_page_bid_micros)
            : undefined,
        };

        // Distinguish between original keywords and related suggestions
        if (request.keywords.includes(keywordText)) {
          metrics.push(metricData);
        } else {
          relatedKeywords.push({
            text: keywordText,
            avgMonthlySearches: metricData.avgMonthlySearches,
            competition: metricData.competition,
            competitionIndex: metricData.competitionIndex,
          });
        }
      }

      return {
        metrics,
        relatedKeywords: relatedKeywords.length > 0 ? relatedKeywords : undefined,
      };
    } catch (error) {
      // Try to extract Google Ads API error details
      if (error && typeof error === 'object' && 'errors' in error) {
        const gadsError = error as any;
        
        if (Array.isArray(gadsError.errors) && gadsError.errors.length > 0) {
          const firstError = gadsError.errors[0];
          const errorMessage = firstError.message || 'Unknown Google Ads API error';
          
          // Log only essential error information
          console.error('Google Ads API Error:', {
            code: firstError.error_code,
            message: errorMessage,
            requestId: gadsError.request_id
          });
          
          throw new GoogleAdsError(
            errorMessage,
            'KEYWORD_METRICS_ERROR',
            error
          );
        }
      }
      
      // Fallback for other errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('KeywordPlannerService Error:', errorMessage);
      
      throw new GoogleAdsError(
        `Failed to fetch keyword metrics: ${errorMessage}`,
        'KEYWORD_METRICS_ERROR',
        error
      );
    }
  }

  /**
   * Get historical metrics for specific keywords
   */
  async getHistoricalMetrics(
    keywords: string[],
    locationIds?: string[]
  ): Promise<KeywordPlanMetrics[]> {
    const request: KeywordPlanRequest = {
      keywords,
      locationIds,
    };

    const response = await this.getKeywordMetrics(request);
    return response.metrics;
  }

  /**
   * Get global keyword metrics (worldwide data)
   */
  async getGlobalKeywordMetrics(
    keywords: string[]
  ): Promise<KeywordPlanMetrics[]> {
    // Use major market location IDs for global aggregate
    // 2840 = United States, 2826 = United Kingdom, 2392 = Japan, 
    // 2276 = Germany, 2250 = France, 2036 = Canada
    const globalLocationIds = ['2840', '2826', '2392', '2276', '2250', '2036'];
    
    const request: KeywordPlanRequest = {
      keywords,
      locationIds: globalLocationIds,
    };

    const response = await this.getKeywordMetrics(request);
    return response.metrics;
  }

  private getCompetitionLevel(competition: any): string {
    if (typeof competition === 'number') {
      // If it's a number, map it to a level
      if (competition === 1) return 'LOW';
      if (competition === 2) return 'MEDIUM';
      if (competition === 3) return 'HIGH';
      return 'UNSPECIFIED';
    }
    return String(competition || 'UNSPECIFIED');
  }
}

