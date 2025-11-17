/**
 * Verification Service
 * Handles AI-based verification and scoring of submissions
 */

interface ScoreSubmissionParams {
  imageUrl?: string | string[];
  geotag?: { lat: number; lng: number };
  description?: string;
}

interface ScoreResult {
  aiScore: number;
  verified: boolean;
}

/**
 * Count words in a string
 * @param text - Text to count words in
 * @returns Number of words
 */
function countWords(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  // Remove extra whitespace and split by whitespace
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

/**
 * Score a submission based on image, geotag, and description
 * 
 * Scoring rules:
 * - Start with 100 points
 * - If no image → subtract 40
 * - If no geotag → subtract 30
 * - If description < 50 words → subtract 20
 * - Final score between 0–100
 * 
 * @param params - Submission data
 * @param params.imageUrl - Image URL(s) - can be string or array
 * @param params.geotag - Geolocation data with lat and lng
 * @param params.description - Description/notes text
 * @returns Score result with aiScore and verified status
 */
export async function scoreSubmission({
  imageUrl,
  geotag,
  description,
}: ScoreSubmissionParams): Promise<ScoreResult> {
  let score = 100;

  // Check for image
  const hasImage =
    imageUrl &&
    (typeof imageUrl === 'string'
      ? imageUrl.trim().length > 0
      : Array.isArray(imageUrl) && imageUrl.length > 0 && imageUrl.some((url) => url && url.trim().length > 0));

  if (!hasImage) {
    score -= 40;
  }

  // Check for geotag
  const hasGeotag =
    geotag &&
    typeof geotag === 'object' &&
    typeof geotag.lat === 'number' &&
    typeof geotag.lng === 'number' &&
    !isNaN(geotag.lat) &&
    !isNaN(geotag.lng);

  if (!hasGeotag) {
    score -= 30;
  }

  // Check description word count
  const wordCount = description ? countWords(description) : 0;
  if (wordCount < 50) {
    score -= 20;
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Verified if score > 60
  const verified = score > 60;

  return {
    aiScore: score,
    verified,
  };
}

