/**
 * Google Ads API Client Infrastructure Layer
 */

import { GoogleAdsApi, Customer } from 'google-ads-api';
import type { GoogleAdsConfig } from '../types/index.js';
import { GoogleAdsError } from '../types/index.js';

export class GoogleAdsClient {
  private client: GoogleAdsApi;
  private customer: Customer;
  private config: GoogleAdsConfig;

  constructor(config: GoogleAdsConfig) {
    this.config = config;
    
    try {
      this.client = new GoogleAdsApi({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        developer_token: config.developerToken,
      });

      this.customer = this.client.Customer({
        customer_id: config.customerId,
        refresh_token: config.refreshToken,
        login_customer_id: config.loginCustomerId,
      });
    } catch (error) {
      throw new GoogleAdsError(
        'Failed to initialize Google Ads client',
        'INIT_ERROR',
        error
      );
    }
  }

  getCustomer(): Customer {
    return this.customer;
  }

  getClient(): GoogleAdsApi {
    return this.client;
  }

  getCustomerId(): string {
    return this.config.customerId;
  }

  /**
   * Test connection to Google Ads API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.customer.query(`
        SELECT customer.id, customer.descriptive_name
        FROM customer
        LIMIT 1
      `);
      return true;
    } catch (error) {
      throw new GoogleAdsError(
        'Failed to connect to Google Ads API',
        'CONNECTION_ERROR',
        error
      );
    }
  }
}

