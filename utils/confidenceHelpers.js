/**
 * confidenceHelpers.js — ML confidence & mode interpretation utilities
 */

export const getConfidenceTier = (c) =>
  c == null ? 'manual' : c >= 0.85 ? 'high' : c >= 0.70 ? 'medium' : 'low';

export const getConfidenceLabel = (c) =>
  c == null ? null : `${Math.round(c * 100)}%`;

export const shouldFlagForReview = (r) =>
  r.mode === 'auto' && r.confidence != null && r.confidence < 0.70 &&
  (r.status === 'present' || r.status === 'late');

export const confidenceVariant = (tier) =>
  ({ high: 'green', medium: 'amber', low: 'red', manual: 'blue' }[tier] || 'blue');

export const MODE_CONFIG = {
  auto:     { label: '🤖 Auto',     color: 'var(--accent-blue)',   bg: 'var(--accent-blue-dim)' },
  manual:   { label: '✏️ Manual',   color: 'var(--text-secondary)', bg: 'var(--bg-glass)' },
  override: { label: '🔄 Override', color: 'var(--accent-purple)', bg: 'var(--accent-purple-dim)' },
};

export const STATUS_CONFIG = {
  present:    { label: 'Present',  color: 'var(--accent-green)', bg: 'var(--accent-green-dim)' },
  late:       { label: 'Late',     color: 'var(--accent-amber)', bg: 'var(--accent-amber-dim)' },
  absent:     { label: 'Absent',   color: 'var(--accent-red)',   bg: 'var(--accent-red-dim)' },
  'no-class': { label: 'No Class', color: 'var(--text-muted)',   bg: 'var(--bg-glass)' },
};

export const ENROLLMENT_CONFIG = {
  enrolled: { label: 'Enrolled', color: 'var(--accent-green)', bg: 'var(--accent-green-dim)' },
  pending:  { label: 'Pending',  color: 'var(--accent-amber)', bg: 'var(--accent-amber-dim)' },
  failed:   { label: 'Failed',   color: 'var(--accent-red)',   bg: 'var(--accent-red-dim)' },
};
