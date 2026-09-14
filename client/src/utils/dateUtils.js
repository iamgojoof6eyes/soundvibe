/**
 * Utility functions for parsing and formatting timestamps across Firebase and local state.
 */

export const parsePostDate = (timestamp) => {
  if (!timestamp) return null;
  try {
    if (typeof timestamp.toDate === 'function') {
      const d = timestamp.toDate();
      return isNaN(d?.getTime()) ? null : d;
    }
    if (typeof timestamp.toMillis === 'function') {
      const d = new Date(timestamp.toMillis());
      return isNaN(d?.getTime()) ? null : d;
    }
    if (typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000);
    }
    if (typeof timestamp._seconds === 'number') {
      return new Date(timestamp._seconds * 1000);
    }
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? null : timestamp;
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp > 1e11 ? timestamp : timestamp * 1000);
    }
    if (typeof timestamp === 'string') {
      const d = new Date(timestamp);
      return isNaN(d.getTime()) ? null : d;
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const formatPostDate = (timestamp) => {
  const date = parsePostDate(timestamp);
  if (!date) return 'Just now';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If created just now or slight clock skew
  if (diffMs < 60 * 1000) {
    return 'Just now';
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  // Same year: e.g. "Aug 31"
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // Different year: e.g. "Aug 31, 2025"
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatFullDate = (timestamp) => {
  const date = parsePostDate(timestamp);
  if (!date) return undefined;
  try {
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch (e) {
    return date.toLocaleString();
  }
};
