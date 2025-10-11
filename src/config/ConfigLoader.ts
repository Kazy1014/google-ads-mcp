/**
 * Configuration Loader
 */

import type { GoogleAdsConfig } from '../types/index.js';
import { GoogleAdsError } from '../types/index.js';

export class ConfigLoader {
  static loadFromEnvironment(): GoogleAdsConfig {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
    const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

    if (!clientId || !clientSecret || !developerToken || !refreshToken || !customerId) {
      throw new GoogleAdsError(
        'Missing required Google Ads configuration. Please set environment variables: ' +
        'GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_DEVELOPER_TOKEN, ' +
        'GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_CUSTOMER_ID',
        'CONFIG_ERROR'
      );
    }

    return {
      clientId,
      clientSecret,
      developerToken,
      refreshToken,
      customerId: customerId.replace(/-/g, ''), // Remove dashes if present
      loginCustomerId: loginCustomerId?.replace(/-/g, ''),
    };
  }

  static validate(config: GoogleAdsConfig): void {
    if (!config.clientId || config.clientId.trim() === '') {
      throw new GoogleAdsError('Client ID is required', 'VALIDATION_ERROR');
    }

    if (!config.clientSecret || config.clientSecret.trim() === '') {
      throw new GoogleAdsError('Client Secret is required', 'VALIDATION_ERROR');
    }

    if (!config.developerToken || config.developerToken.trim() === '') {
      throw new GoogleAdsError('Developer Token is required', 'VALIDATION_ERROR');
    }

    if (!config.refreshToken || config.refreshToken.trim() === '') {
      throw new GoogleAdsError('Refresh Token is required', 'VALIDATION_ERROR');
    }

    if (!config.customerId || config.customerId.trim() === '') {
      throw new GoogleAdsError('Customer ID is required', 'VALIDATION_ERROR');
    }

    // Validate customer ID format (should be 10 digits)
    if (!/^\d{10}$/.test(config.customerId)) {
      throw new GoogleAdsError(
        'Customer ID must be 10 digits (without dashes)',
        'VALIDATION_ERROR'
      );
    }
  }
}

