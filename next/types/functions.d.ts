import { type FormProps } from '../form-shared';
import React from 'react';
import type { UrlObject } from 'url';

export declare function byteLength(payload: string): number;


export default function DefaultLayout({ children, }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;



import type { IncomingHttpHeaders } from 'node:http';
import type { SizeLimit } from '../../types';
import type { RequestStore } from '../app-render/work-unit-async-storage.external';
import type { AppRenderContext, GenerateFlight } from './app-render';
import type { AppPageModule } from '../route-modules/app-page/module';
import type { BaseNextRequest, BaseNextResponse } from '../base-http';
import RenderResult, { type AppPageRenderResultMetadata } from '../render-result';
import type { WorkStore } from '../app-render/work-async-storage.external';
declare const enum HostType {
    XForwardedHost = "x-forwarded-host",
    Host = "host"
}
export declare function parseHostHeader(headers: IncomingHttpHeaders, originDomain?: string): {
    type: HostType;
    value: string;
} | undefined;
type ServerModuleMap = Record<string, {
    id: string;
    chunks: string[];
    name: string;
}>;
type ServerActionsConfig = {
    bodySizeLimit?: SizeLimit;
    allowedOrigins?: string[];
};
type HandleActionResult = {
    /** An MPA action threw notFound(), and we need to render the appropriate HTML */
    type: 'not-found';
} | {
    type: 'done';
    result: RenderResult | undefined;
    formState?: any;
}
/** The request turned out not to be a server action. */
 | null;
export declare function handleAction({ req, res, ComponentMod, serverModuleMap, generateFlight, workStore, requestStore, serverActions, ctx, metadata, }: {
    req: BaseNextRequest;
    res: BaseNextResponse;
    ComponentMod: AppPageModule;
    serverModuleMap: ServerModuleMap;
    generateFlight: GenerateFlight;
    workStore: WorkStore;
    requestStore: RequestStore;
    serverActions?: ServerActionsConfig;
    ctx: AppRenderContext;
    metadata: AppPageRenderResultMetadata;
}): Promise<HandleActionResult>;
export {};


export type { FormProps };
export default function Form({ replace, scroll, prefetch: prefetchProp, ref: externalRef, ...props }: FormProps): import("react/jsx-runtime").JSX.Element;

type Url = string | UrlObject;
type OnNavigateEventHandler = (event: {
    preventDefault: () => void;
}) => void;
type InternalLinkProps = {
    /**
     * **Required**. The path or URL to navigate to. It can also be an object (similar to `URL`).
     *
     * @example
     * ```tsx
     * // Navigate to /dashboard:
     * <Link href="/dashboard">Dashboard</Link>
     *
     * // Navigate to /about?name=test:
     * <Link href={{ pathname: '/about', query: { name: 'test' } }}>
     *   About
     * </Link>
     * ```
     *
     * @remarks
     * - For external URLs, use a fully qualified URL such as `https://...`.
     * - In the App Router, dynamic routes must not include bracketed segments in `href`.
     */
    href: Url;
    /**
     * @deprecated v10.0.0: `href` props pointing to a dynamic route are
     * automatically resolved and no longer require the `as` prop.
     */
    as?: Url;
    /**
     * Replace the current `history` state instead of adding a new URL into the stack.
     *
     * @defaultValue `false`
     *
     * @example
     * ```tsx
     * <Link href="/about" replace>
     *   About (replaces the history state)
     * </Link>
     * ```
     */
    replace?: boolean;
    /**
     * Whether to override the default scroll behavior. If `true`, Next.js attempts to maintain
     * the scroll position if the newly navigated page is still visible. If not, it scrolls to the top.
     *
     * If `false`, Next.js will not modify the scroll behavior at all.
     *
     * @defaultValue `true`
     *
     * @example
     * ```tsx
     * <Link href="/dashboard" scroll={false}>
     *   No auto scroll
     * </Link>
     * ```
     */
    scroll?: boolean;
    /**
     * Update the path of the current page without rerunning data fetching methods
     * like `getStaticProps`, `getServerSideProps`, or `getInitialProps`.
     *
     * @remarks
     * `shallow` only applies to the Pages Router. For the App Router, see the
     * [following documentation](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#using-the-native-history-api).
     *
     * @defaultValue `false`
     *
     * @example
     * ```tsx
     * <Link href="/blog" shallow>
     *   Shallow navigation
     * </Link>
     * ```
     */
    shallow?: boolean;
    /**
     * Forces `Link` to pass its `href` to the child component. Useful if the child is a custom
     * component that wraps an `<a>` tag, or if you're using certain styling libraries.
     *
     * @defaultValue `false`
     *
     * @example
     * ```tsx
     * <Link href="/dashboard" passHref>
     *   <MyStyledAnchor>Dashboard</MyStyledAnchor>
     * </Link>
     * ```
     */
    passHref?: boolean;
    /**
     * Prefetch the page in the background.
     * Any `<Link />` that is in the viewport (initially or through scroll) will be prefetched.
     * Prefetch can be disabled by passing `prefetch={false}`.
     *
     * @remarks
     * Prefetching is only enabled in production.
     *
     * - In the **App Router**:
     *   - `"auto"`, `null`, `undefined` (default): Prefetch behavior depends on static vs dynamic routes:
     *     - Static routes: fully prefetched
     *     - Dynamic routes: partial prefetch to the nearest segment with a `loading.js`
     *   - `true`: Always prefetch the full route and data.
     *   - `false`: Disable prefetching on both viewport and hover.
     * - In the **Pages Router**:
     *   - `true` (default): Prefetches the route and data in the background on viewport or hover.
     *   - `false`: Prefetch only on hover, not on viewport.
     *
     * @defaultValue `true` (Pages Router) or `null` (App Router)
     *
     * @example
     * ```tsx
     * <Link href="/dashboard" prefetch={false}>
     *   Dashboard
     * </Link>
     * ```
     */
    prefetch?: boolean | 'auto' | null | 'unstable_forceStale';
    /**
     * (unstable) Switch to a full prefetch on hover. Effectively the same as
     * updating the prefetch prop to `true` in a mouse event.
     */
    unstable_dynamicOnHover?: boolean;
    /**
     * The active locale is automatically prepended in the Pages Router. `locale` allows for providing
     * a different locale, or can be set to `false` to opt out of automatic locale behavior.
     *
     * @remarks
     * Note: locale only applies in the Pages Router and is ignored in the App Router.
     *
     * @example
     * ```tsx
     * // Use the 'fr' locale:
     * <Link href="/about" locale="fr">
     *   About (French)
     * </Link>
     *
     * // Disable locale prefix:
     * <Link href="/about" locale={false}>
     *   About (no locale prefix)
     * </Link>
     * ```
     */
    locale?: string | false;
    /**
     * Enable legacy link behavior, requiring an `<a>` tag to wrap the child content
     * if the child is a string or number.
     *
     * @deprecated This will be removed in v16
     * @defaultValue `false`
     * @see https://github.com/vercel/next.js/commit/489e65ed98544e69b0afd7e0cfc3f9f6c2b803b7
     */
    legacyBehavior?: boolean;
    /**
     * Optional event handler for when the mouse pointer is moved onto the `<Link>`.
     */
    onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
    /**
     * Optional event handler for when the `<Link>` is touched.
     */
    onTouchStart?: React.TouchEventHandler<HTMLAnchorElement>;
    /**
     * Optional event handler for when the `<Link>` is clicked.
     */
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    /**
     * Optional event handler for when the `<Link>` is navigated.
     */
    onNavigate?: OnNavigateEventHandler;
};
export type LinkProps<RouteInferType = any> = InternalLinkProps;
/**
 * A React component that extends the HTML `<a>` element to provide
 * [prefetching](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#2-prefetching)
 * and client-side navigation. This is the primary way to navigate between routes in Next.js.
 *
 * @remarks
 * - Prefetching is only enabled in production.
 *
 * @see https://nextjs.org/docs/app/api-reference/components/link
 */
export default function LinkComponent(props: LinkProps & {
    children: React.ReactNode;
    ref: React.Ref<HTMLAnchorElement>;
}): import("react/jsx-runtime").JSX.Element;
export declare const useLinkStatus: () => {
    pending: boolean;
} | {
    pending: boolean;
};
export {};


export type GlobalErrorComponent = React.ComponentType<{
    error: any;
}>;
declare function DefaultGlobalError({ error }: {
    error: any;
}): import("react/jsx-runtime").JSX.Element;
export default DefaultGlobalError;


declare function GlobalNotFound(): import("react/jsx-runtime").JSX.Element;
export default GlobalNotFound;


export declare const HTTPAccessErrorStatus: {
    NOT_FOUND: number;
    FORBIDDEN: number;
    UNAUTHORIZED: number;
};
export declare const HTTP_ERROR_FALLBACK_ERROR_CODE = "NEXT_HTTP_ERROR_FALLBACK";
export type HTTPAccessFallbackError = Error & {
    digest: `${typeof HTTP_ERROR_FALLBACK_ERROR_CODE};${string}`;
};
/**
 * Checks an error to determine if it's an error generated by
 * the HTTP navigation APIs `notFound()`, `forbidden()` or `unauthorized()`.
 *
 * @param error the error that may reference a HTTP access error
 * @returns true if the error is a HTTP access error
 */
export declare function isHTTPAccessFallbackError(error: unknown): error is HTTPAccessFallbackError;
export declare function getAccessFallbackHTTPStatus(error: HTTPAccessFallbackError): number;
export declare function getAccessFallbackErrorTypeByStatus(status: number): 'not-found' | 'forbidden' | 'unauthorized' | undefined;

