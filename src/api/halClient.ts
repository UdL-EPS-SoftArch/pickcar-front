import halfred, {Resource} from "halfred";
import { parseApiError } from "./apiError";

export { ApiError, isApiError } from "./apiError";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://127.0.0.1:8080";

type AuthSource = { getAuth: () => Promise<string | null> };

export type RequestOptions = {
    /** Extra headers, e.g. `{ "X-Current-Password": "..." }` */
    headers?: Record<string, string>;
};

export function mergeHal<T>(obj: Resource): (T & Resource) {
    return Object.assign(obj, halfred.parse(obj)) as T & Resource;
}

export function mergeHalArray<T>(objs: Resource[]): (T & Resource)[] {
    return objs.map(o => Object.assign(o, halfred.parse(o)) as T & Resource);
}

type Payload = { json: object } | { form: FormData } | undefined;

/**
 * Single entry point for every backend call. Throws ApiError on non-2xx.
 * Returns the parsed HAL resource, or an empty resource for 204 / empty bodies.
 */
async function request(method: string, path: string, authProvider: AuthSource, payload?: Payload, options: RequestOptions = {}): Promise<Resource> {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const authorization = await authProvider.getAuth();

    const headers: Record<string, string> = {
        "Accept": "application/hal+json",
        ...(payload && "json" in payload ? { "Content-Type": "application/json" } : {}),
        // FormData sets its own multipart Content-Type with the boundary
        ...options.headers,
        ...(authorization ? { Authorization: authorization } : {}),
    };

    const res = await fetch(url, {
        method,
        headers,
        body: payload ? ("json" in payload ? JSON.stringify(payload.json) : payload.form) : undefined,
        cache: "no-store",
    });

    if (!res.ok) {
        throw await parseApiError(res);
    }

    const text = res.status === 204 ? "" : await res.text();
    return halfred.parse(text ? JSON.parse(text) : {});
}

export async function getHal(path: string, authProvider: AuthSource, options?: RequestOptions) {
    return request("GET", path, authProvider, undefined, options);
}

export async function postHal(path: string, body: object, authProvider: AuthSource, options?: RequestOptions) {
    return request("POST", path, authProvider, { json: body }, options);
}

/** Partial update: only the fields in `body` change */
export async function patchHal(path: string, body: object, authProvider: AuthSource, options?: RequestOptions) {
    return request("PATCH", path, authProvider, { json: body }, options);
}

/** Full replacement: fields missing from `body` are cleared by Spring Data REST */
export async function putHal(path: string, body: object, authProvider: AuthSource, options?: RequestOptions) {
    return request("PUT", path, authProvider, { json: body }, options);
}

export async function deleteHal(path: string, authProvider: AuthSource, options?: RequestOptions): Promise<void> {
    await request("DELETE", path, authProvider, undefined, options);
}

/** File upload (`multipart/form-data`) */
export async function postMultipart(path: string, form: FormData, authProvider: AuthSource, options?: RequestOptions) {
    return request("POST", path, authProvider, { form }, options);
}
