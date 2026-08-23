/**
 * Security & Sanitization Utilities for @brainbase/react-widget
 */

import { BRAINBASE_BACKEND_URL, DEFAULT_PRIMARY_COLOR } from '../constants';

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/**
 * Validates and safely extracts a primary theme color to prevent CSS injection.
 */
export function getSafePrimaryColor(color?: unknown, fallback = DEFAULT_PRIMARY_COLOR): string {
  if (typeof color === 'string' && HEX_COLOR_REGEX.test(color.trim())) {
    return color.trim();
  }
  return fallback;
}

/**
 * Sanitizes and truncates user or API text strings to prevent UI defacement or excessive payload memory DOS.
 */
export function sanitizeText(text?: unknown, maxLength = 1000): string {
  if (typeof text !== 'string') {
    return '';
  }
  return text.trim().slice(0, maxLength);
}

/**
 * Validates public agent key format.
 */
export function isValidAgentKey(key?: unknown): boolean {
  if (typeof key !== 'string') {
    return false;
  }
  const trimmed = key.trim();
  return trimmed.length >= 8 && trimmed.length <= 128;
}

/**
 * Returns the Brainbase backend API URL.
 */
export function getSafeBackendUrl(customUrl?: unknown): string {
  if (typeof customUrl === 'string' && customUrl.trim().length > 0) {
    return customUrl.trim().replace(/\/+$/, '');
  }
  return BRAINBASE_BACKEND_URL.replace(/\/+$/, '');
}
