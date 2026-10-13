const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True if the text is an email address (people sometimes type theirs as their name). */
export function looksLikeEmail(text: string | null | undefined): boolean {
  return EMAIL.test((text ?? "").trim());
}

/**
 * The name to show other people. Never an email address: community lists,
 * score pages and comments are public.
 */
export function publicAuthorName(name: string | null | undefined, fallback = "Anonymous"): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed || looksLikeEmail(trimmed)) return fallback;
  return trimmed;
}
