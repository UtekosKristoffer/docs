import type { NextApiRequestCookies } from '.';
import type { IncomingMessage } from 'http';
import type { BaseNextRequest } from '../base-http';
import type { NextApiResponse } from '../../shared/lib/utils';
import type { ReadonlyURLSearchParams } from 'next/navigation'
import type { Params } from '../../server/request/params';
export declare const SearchParamsContext: import("react").Context<URLSearchParams | null>;
export declare const PathnameContext: import("react").Context<string | null>;
export declare const PathParamsContext: import("react").Context<Params | null>;

import React, { type JSX } from 'react';
export declare function defaultHead(inAmpMode?: boolean): JSX.Element[];
/**
 * This component injects elements to `<head>` of your page.
 * To avoid duplicated `tags` in `<head>` you can use the `key` property, which will make sure every tag is only rendered once.
 */
declare function Head({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export default Head;


declare module 'next/navigation' {
  /**
   * Get a read-only URLSearchParams object. For example searchParams.get('foo') would return 'bar' when ?foo=bar
   * Learn more about URLSearchParams here: https://developer.mozilla.org/docs/Web/API/URLSearchParams
   *
   * If used from `pages/`, the hook may return `null` when the router is not
   * ready.
   */
  export function useSearchParams(): ReadonlyURLSearchParams | null

  /**
   * Get the current pathname. For example, if the URL is
   * https://example.com/foo?bar=baz, the pathname would be /foo.
   *
   * If the hook is accessed from `pages/`, the pathname may be `null` when the
   * router is not ready.
   */
  export function usePathname(): string | null

  /**
   * Get the current parameters. For example useParams() on /dashboard/[team]
   * where pathname is /dashboard/nextjs would return { team: 'nextjs' }
   *
   * If used from `pages/`, the hook will return `null`.
   */
  export function useParams<
    T extends Record<string, string | string[]> = Record<
      string,
      string | string[]
    >,
  >(): T | null

  /**
   * A [Client Component](https://nextjs.org/docs/app/building-your-application/rendering/client-components) hook
   * that lets you read the active route segments **below** the Layout it is called from.
   *
   * If used from `pages/`, the hook will return `null`.
   */
  export function useSelectedLayoutSegments(): string[] | null

  /**
   * A [Client Component](https://nextjs.org/docs/app/building-your-application/rendering/client-components) hook
   * that lets you read the active route segment **one level below** the Layout it is called from.
   *
   * If used from `pages/`, the hook will return `null`.
   */
  export function useSelectedLayoutSegment(): string | null
}

/**
 * Parse cookies from the `headers` of request
 * @param req request object
 */
export declare function getCookieParser(headers: {
    [key: string]: string | string[] | null | undefined;
}): () => NextApiRequestCookies;


export type NextApiRequestCookies = Partial<{
    [key: string]: string;
}>;
export type NextApiRequestQuery = Partial<{
    [key: string]: string | string[];
}>;
export type __ApiPreviewProps = {
    previewModeId: string;
    previewModeEncryptionKey: string;
    previewModeSigningKey: string;
};
export declare function wrapApiHandler<T extends (...args: any[]) => any>(page: string, handler: T): T;
/**
 *
 * @param res response object
 * @param statusCode `HTTP` status code of response
 */
export declare function sendStatusCode(res: NextApiResponse, statusCode: number): NextApiResponse<any>;
/**
 *
 * @param res response object
 * @param [statusOrUrl] `HTTP` status code of redirect
 * @param url URL of redirect
 */
export declare function redirect(res: NextApiResponse, statusOrUrl: string | number, url?: string): NextApiResponse<any>;
export declare function checkIsOnDemandRevalidate(req: Request | IncomingMessage | BaseNextRequest, previewProps: __ApiPreviewProps): {
    isOnDemandRevalidate: boolean;
    revalidateOnlyGenerated: boolean;
};
export declare const COOKIE_NAME_PRERENDER_BYPASS = "__prerender_bypass";
export declare const COOKIE_NAME_PRERENDER_DATA = "__next_preview_data";
export declare const RESPONSE_LIMIT_DEFAULT: number;
export declare const SYMBOL_PREVIEW_DATA: unique symbol;
export declare const SYMBOL_CLEARED_COOKIES: unique symbol;
export declare function clearPreviewData<T>(res: NextApiResponse<T>, options?: {
    path?: string;
}): NextApiResponse<T>;
/**
 * Custom error class
 */
export declare class ApiError extends Error {
    readonly statusCode: number;
    constructor(statusCode: number, message: string);
}
/**
 * Sends error in `response`
 * @param res response object
 * @param statusCode of response
 * @param message of response
 */
export declare function sendError(res: NextApiResponse, statusCode: number, message: string): void;
interface LazyProps {
    req: IncomingMessage;
}
/**
 * Execute getter function only if its needed
 * @param LazyProps `req` and `params` for lazyProp
 * @param prop name of property
 * @param getter function to get data
 */
export declare function setLazyProp<T>({ req }: LazyProps, prop: string, getter: () => T): void;
export {};
