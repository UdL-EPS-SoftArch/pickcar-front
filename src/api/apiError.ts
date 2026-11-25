/**
 * Error thrown by halClient when the backend answers with a non-2xx status.
 *
 * It never carries the request body (it may hold passwords) nor the
 * `invalidValue` that Spring Data REST echoes back in validation errors.
 */
export class ApiError extends Error {
    readonly status: number;
    /** Backend validation messages by property, e.g. `{ email: "must be a well-formed email address" }` */
    readonly fieldErrors?: Record<string, string>;
    /** Machine-readable error code, for custom endpoints that send `{ code, message }` (backend gap B6, #1) */
    readonly code?: string;

    constructor(status: number, message: string, options: { fieldErrors?: Record<string, string>; code?: string } = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.fieldErrors = options.fieldErrors;
        this.code = options.code;
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

const DEFAULT_MESSAGES: Record<number, string> = {
    400: "The request is not valid",
    401: "You need to sign in",
    403: "You are not allowed to do this",
    404: "Not found",
    409: "The request conflicts with existing data",
};

function defaultMessage(status: number): string {
    return DEFAULT_MESSAGES[status] ?? (status >= 500 ? "Server error, try again later" : `Request failed (HTTP ${status})`);
}

type ValidationError = { property?: unknown; message?: unknown };

/**
 * Builds an ApiError from a failed response. Understands:
 * - Spring Data REST validation: `{ errors: [{ property, message, invalidValue }] }`
 * - Plain bodies: `{ message }`, optionally with `code`
 * - Spring Boot error pages: `{ status, error, message, path }`
 * - Empty or non-JSON bodies (falls back to a message per status)
 */
export async function parseApiError(res: Response): Promise<ApiError> {
    let body: unknown = null;
    try {
        const text = await res.text();
        body = text ? JSON.parse(text) : null;
    } catch {
        body = null;
    }

    if (!body || typeof body !== "object") {
        return new ApiError(res.status, defaultMessage(res.status));
    }

    const data = body as { errors?: unknown; message?: unknown; code?: unknown };
    const code = typeof data.code === "string" ? data.code : undefined;

    if (Array.isArray(data.errors)) {
        const fieldErrors: Record<string, string> = {};
        for (const error of data.errors as ValidationError[]) {
            if (typeof error?.property !== "string" || typeof error.message !== "string") continue;
            // Several constraints can fail on one property: keep them all
            fieldErrors[error.property] = fieldErrors[error.property]
                ? `${fieldErrors[error.property]}; ${error.message}`
                : error.message;
        }
        if (Object.keys(fieldErrors).length > 0) {
            const message = Object.values(fieldErrors)[0];
            return new ApiError(res.status, message, { fieldErrors, code });
        }
    }

    const message = typeof data.message === "string" && data.message.trim() ? data.message : defaultMessage(res.status);
    return new ApiError(res.status, message, { code });
}
