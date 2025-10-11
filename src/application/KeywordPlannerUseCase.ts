/**
 * Keyword Planner Use Cases Application Layer
 */

import type { KeywordPlannerService } from '../domain/KeywordPlannerService.js';
import type { KeywordPlanMetrics } from '../types/index.js';

export interface KeywordAnalysisResult {
  keyword: string;
  globalInterest: {
    avgMonthlySearches: number;
    competition: string;
    competitionIndex: number;
    trend: string;
  };
  bidEstimates?: {
    lowBid: number;
    highBid: number;
    currency: string;
  };
}

export class KeywordPlannerUseCase {
  constructor(private keywordPlannerService: KeywordPlannerService) {}

  /**
   * Analyze global interest for specific keywords
   */
  async analyzeGlobalInterest(
    keywords: string[]
  ): Promise<KeywordAnalysisResult[]> {
    const metrics = await this.keywordPlannerService.getGlobalKeywordMetrics(
      keywords
    );

    return metrics.map((metric) => this.transformToAnalysisResult(metric));
  }

  /**
   * Analyze keyword interest for specific locations
   */
  async analyzeKeywordsByLocation(
    keywords: string[],
    locationIds: string[]
  ): Promise<KeywordAnalysisResult[]> {
    const metrics = await this.keywordPlannerService.getHistoricalMetrics(
      keywords,
      locationIds
    );

    return metrics.map((metric) => this.transformToAnalysisResult(metric));
  }

  /**
   * Get detailed keyword plan with related keywords
   */
  async getDetailedKeywordPlan(keywords: string[]) {
    const response = await this.keywordPlannerService.getKeywordMetrics({
      keywords,
    });

    return {
      mainKeywords: response.metrics.map((m) =>
        this.transformToAnalysisResult(m)
      ),
      relatedKeywords: response.relatedKeywords?.map((k) => ({
        keyword: k.text,
        avgMonthlySearches: k.avgMonthlySearches,
        competition: k.competition,
        competitionIndex: k.competitionIndex,
      })),
    };
  }

  private transformToAnalysisResult(
    metric: KeywordPlanMetrics
  ): KeywordAnalysisResult {
    const result: KeywordAnalysisResult = {
      keyword: metric.keyword,
      globalInterest: {
        avgMonthlySearches: metric.avgMonthlySearches,
        competition: metric.competition,
        competitionIndex: metric.competitionIndex,
        trend: this.calculateTrend(metric.avgMonthlySearches),
      },
    };

    if (
      metric.lowTopOfPageBidMicros !== undefined &&
      metric.highTopOfPageBidMicros !== undefined
    ) {
      result.bidEstimates = {
        lowBid: metric.lowTopOfPageBidMicros / 1_000_000,
        highBid: metric.highTopOfPageBidMicros / 1_000_000,
        currency: 'USD',
      };
    }

    return result;
  }

  private calculateTrend(avgMonthlySearches: number): string {
    if (avgMonthlySearches > 100000) return 'Very High';
    if (avgMonthlySearches > 10000) return 'High';
    if (avgMonthlySearches > 1000) return 'Medium';
    if (avgMonthlySearches > 100) return 'Low';
    return 'Very Low';
  }
}

