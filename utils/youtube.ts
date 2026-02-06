// YouTube utility functions

/**
 * Extract YouTube video ID from various URL formats
 */
export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Get YouTube embed URL from video ID or URL
 */
export const getYouTubeEmbedUrl = (urlOrId: string): string => {
  const videoId = extractYouTubeId(urlOrId) || urlOrId;
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Get YouTube thumbnail URL
 */
export const getYouTubeThumbnail = (urlOrId: string, quality: 'default' | 'medium' | 'high' = 'high'): string => {
  const videoId = extractYouTubeId(urlOrId) || urlOrId;
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

