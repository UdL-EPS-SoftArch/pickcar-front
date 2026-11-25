/**
 * Last path segment of a Spring Data REST resource URI, e.g. "/users/3" -> "3".
 * Accepts relative URIs ("uri" field) and absolute ones ("_links.self.href").
 */
export function idFromUri(uri: string | null | undefined): string | null {
    if (!uri) return null;
    const path = uri.startsWith("http") ? new URL(uri).pathname : uri;
    const id = path.split("/").filter(Boolean).pop();
    return id ?? null;
}
