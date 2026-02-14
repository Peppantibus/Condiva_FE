type SanitizeOptions = {
  fallback?: string;
  maxLength?: number;
};

const HTML_TAG_REGEX = /<[^>]*>/g;
const CONTROL_CHARS_REGEX = /[\u0000-\u001f\u007f]/g;
const WHITESPACE_REGEX = /\s+/g;

export const sanitizePlainText = (value: unknown, options: SanitizeOptions = {}): string => {
  const fallback = options.fallback ?? '';
  if (typeof value !== 'string') return fallback;

  const withoutTags = value.replace(HTML_TAG_REGEX, ' ');
  const withoutControls = withoutTags.replace(CONTROL_CHARS_REGEX, '');
  const normalized = withoutControls.replace(WHITESPACE_REGEX, ' ').trim();

  if (!normalized) return fallback;

  if (typeof options.maxLength === 'number' && options.maxLength > 0 && normalized.length > options.maxLength) {
    return normalized.slice(0, options.maxLength).trimEnd();
  }

  return normalized;
};
