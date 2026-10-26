/** Deck share-id route param: 8 base64url characters. */
export function match(param: string): boolean {
	return /^[A-Za-z0-9_-]{8}$/.test(param);
}
