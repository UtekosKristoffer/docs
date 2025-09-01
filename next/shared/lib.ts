import type React from 'react';
import { type JSX } from 'react';
import type { HtmlProps } from './html-context.shared-runtime';
import type { ComponentType, JSX } from 'react';
import type { DomainLocale } from '../../server/config';
import type { Env } from '@next/env';
import type { IncomingMessage, ServerResponse } from 'http';
import type { NextRouter } from './router/router';
import type { ParsedUrlQuery } from 'querystring';
import type { PreviewData } from '../../types';
import type { COMPILER_NAMES } from './constants';
import type fs from 'fs';


import type { ImageConfigComplete, ImageLoaderProps, ImageLoaderPropsWithConfig } from './image-config';
import type { CSSProperties, JSX } from 'react';
export interface StaticImageData {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
    blurWidth?: number;
    blurHeight?: number;
}
export interface StaticRequire {
    default: StaticImageData;
}
export type StaticImport = StaticRequire | StaticImageData;
export type ImageProps = Omit<JSX.IntrinsicElements['img'], 'src' | 'srcSet' | 'ref' | 'alt' | 'width' | 'height' | 'loading'> & {
    src: string | StaticImport;
    alt: string;
    width?: number | `${number}`;
    height?: number | `${number}`;
    fill?: boolean;
    loader?: ImageLoader;
    quality?: number | `${number}`;
    priority?: boolean;
    loading?: LoadingValue;
    placeholder?: PlaceholderValue;
    blurDataURL?: string;
    unoptimized?: boolean;
    overrideSrc?: string;
    /**
     * @deprecated Use `onLoad` instead.
     * @see https://nextjs.org/docs/app/api-reference/components/image#onload
     */
    onLoadingComplete?: OnLoadingComplete;
    /**
     * @deprecated Use `fill` prop instead of `layout="fill"` or change import to `next/legacy/image`.
     * @see https://nextjs.org/docs/api-reference/next/legacy/image
     */
    layout?: string;
    /**
     * @deprecated Use `style` prop instead.
     */
    objectFit?: string;
    /**
     * @deprecated Use `style` prop instead.
     */
    objectPosition?: string;
    /**
     * @deprecated This prop does not do anything.
     */
    lazyBoundary?: string;
    /**
     * @deprecated This prop does not do anything.
     */
    lazyRoot?: string;
};
export type ImgProps = Omit<ImageProps, 'src' | 'loader'> & {
    loading: LoadingValue;
    width: number | undefined;
    height: number | undefined;
    style: NonNullable<JSX.IntrinsicElements['img']['style']>;
    sizes: string | undefined;
    srcSet: string | undefined;
    src: string;
};
declare const VALID_LOADING_VALUES: readonly ["lazy", "eager", undefined];
type LoadingValue = (typeof VALID_LOADING_VALUES)[number];
export type ImageLoader = (p: ImageLoaderProps) => string;
type ImageLoaderWithConfig = (p: ImageLoaderPropsWithConfig) => string;
export type PlaceholderValue = 'blur' | 'empty' | `data:image/${string}`;
export type OnLoad = React.ReactEventHandler<HTMLImageElement> | undefined;
export type OnLoadingComplete = (img: HTMLImageElement) => void;
export type PlaceholderStyle = Partial<Pick<CSSProperties, 'backgroundSize' | 'backgroundPosition' | 'backgroundRepeat' | 'backgroundImage'>>;
/**
 * A shared function, used on both client and server, to generate the props for <img>.
 */
export declare function getImgProps({ src, sizes, unoptimized, priority, loading, className, quality, width, height, fill, style, overrideSrc, onLoad, onLoadingComplete, placeholder, blurDataURL, fetchPriority, decoding, layout, objectFit, objectPosition, lazyBoundary, lazyRoot, ...rest }: ImageProps, _state: {
    defaultLoader: ImageLoaderWithConfig;
    imgConf: ImageConfigComplete;
    showAltText?: boolean;
    blurComplete?: boolean;
}): {
    props: ImgProps;
    meta: {
        unoptimized: boolean;
        priority: boolean;
        placeholder: NonNullable<ImageProps['placeholder']>;
        fill: boolean;
    };
};
export {};

export interface ServerReference {
    $$typeof: Symbol;
    $$id: string;
}
export type ServerFunction = ServerReference & ((...args: unknown[]) => Promise<unknown>);
export declare function isServerReference<T>(value: T & Partial<ServerReference>): value is T & ServerFunction;
export declare function isUseCacheFunction<T>(value: T & Partial<ServerReference>): value is T & ServerFunction;
export declare function isClientReference(mod: any): boolean;



export interface ServerReferenceInfo {
    type: 'server-action' | 'use-cache';
    usedArgs: [boolean, boolean, boolean, boolean, boolean, boolean];
    hasRestArgs: boolean;
}
/**
 * Extracts info about the server reference for the given server reference ID by
 * parsing the first byte of the hex-encoded ID.
 *
 * ```
 * Bit positions: [7]      [6] [5] [4] [3] [2] [1]  [0]
 * Bits:          typeBit  argMask                  restArgs
 * ```
 *
 * If the `typeBit` is `1` the server reference represents a `"use cache"`
 * function, otherwise a server action.
 *
 * The `argMask` encodes whether the function uses the argument at the
 * respective position.
 *
 * The `restArgs` bit indicates whether the function uses a rest parameter. It's
 * also set to 1 if the function has more than 6 args.
 *
 * @param id hex-encoded server reference ID
 */
export declare function extractInfoFromServerReferenceId(id: string): ServerReferenceInfo;
/**
 * Creates a sparse array containing only the used arguments based on the
 * provided action info.
 */
export declare function omitUnusedArgs(args: unknown[], info: ServerReferenceInfo): unknown[];

export type NextComponentType<Context extends BaseContext = NextPageContext, InitialProps = {}, Props = {}> = ComponentType<Props> & {
    /**
     * Used for initial page load data population. Data returned from `getInitialProps` is serialized when server rendered.
     * Make sure to return plain `Object` without using `Date`, `Map`, `Set`.
     * @param context Context of `page`
     */
    getInitialProps?(context: Context): InitialProps | Promise<InitialProps>;
};
export type DocumentType = NextComponentType<DocumentContext, DocumentInitialProps, DocumentProps>;
export type AppType<P = {}> = NextComponentType<AppContextType, P, AppPropsType<any, P>>;
export type AppTreeType = ComponentType<AppInitialProps & {
    [name: string]: any;
}>;
/**
 * Web vitals provided to _app.reportWebVitals by Core Web Vitals plugin developed by Google Chrome team.
 * https://nextjs.org/blog/next-9-4#integrated-web-vitals-reporting
 */
export declare const WEB_VITALS: readonly ["CLS", "FCP", "FID", "INP", "LCP", "TTFB"];
export type NextWebVitalsMetric = {
    id: string;
    startTime: number;
    value: number;
    attribution?: {
        [key: string]: unknown;
    };
} & ({
    label: 'web-vital';
    name: (typeof WEB_VITALS)[number];
} | {
    label: 'custom';
    name: 'Next.js-hydration' | 'Next.js-route-change-to-render' | 'Next.js-render';
});
export type Enhancer<C> = (Component: C) => C;
export type ComponentsEnhancer = {
    enhanceApp?: Enhancer<AppType>;
    enhanceComponent?: Enhancer<NextComponentType>;
} | Enhancer<NextComponentType>;
export type RenderPageResult = {
    html: string;
    head?: Array<JSX.Element | null>;
};
export type RenderPage = (options?: ComponentsEnhancer) => DocumentInitialProps | Promise<DocumentInitialProps>;
export type BaseContext = {
    res?: ServerResponse;
    [k: string]: any;
};

export declare function normalizePath(file: string): string;

export type NEXT_DATA = {
    props: Record<string, any>;
    page: string;
    query: ParsedUrlQuery;
    buildId: string;
    assetPrefix?: string;
    runtimeConfig?: {
        [key: string]: any;
    };
    nextExport?: boolean;
    autoExport?: boolean;
    isFallback?: boolean;
    isExperimentalCompile?: boolean;
    dynamicIds?: (string | number)[];
    err?: Error & {
        statusCode?: number;
        source?: typeof COMPILER_NAMES.server | typeof COMPILER_NAMES.edgeServer;
    };
    gsp?: boolean;
    gssp?: boolean;
    customServer?: boolean;
    gip?: boolean;
    appGip?: boolean;
    locale?: string;
    locales?: readonly string[];
    defaultLocale?: string;
    domainLocales?: readonly DomainLocale[];
    scriptLoader?: any[];
    isPreview?: boolean;
    notFoundSrcPage?: string;
};
/**
 * `Next` context
 */
export interface NextPageContext {
    /**
     * Error object if encountered during rendering
     */
    err?: (Error & {
        statusCode?: number;
    }) | null;
    /**
     * `HTTP` request object.
     */
    req?: IncomingMessage;
    /**
     * `HTTP` response object.
     */
    res?: ServerResponse;
    /**
     * Path section of `URL`.
     */
    pathname: string;
    /**
     * Query string section of `URL` parsed as an object.
     */
    query: ParsedUrlQuery;
    /**
     * `String` of the actual path including query.
     */
    asPath?: string;
    /**
     * The currently active locale
     */
    locale?: string;
    /**
     * All configured locales
     */
    locales?: readonly string[];
    /**
     * The configured default locale
     */
    defaultLocale?: string;
    /**
     * `Component` the tree of the App to use if needing to render separately
     */
    AppTree: AppTreeType;
}
export type AppContextType<Router extends NextRouter = NextRouter> = {
    Component: NextComponentType<NextPageContext>;
    AppTree: AppTreeType;
    ctx: NextPageContext;
    router: Router;
};
export type AppInitialProps<PageProps = any> = {
    pageProps: PageProps;
};
export type AppPropsType<Router extends NextRouter = NextRouter, PageProps = {}> = AppInitialProps<PageProps> & {
    Component: NextComponentType<NextPageContext, any, any>;
    router: Router;
    __N_SSG?: boolean;
    __N_SSP?: boolean;
};
export type DocumentContext = NextPageContext & {
    renderPage: RenderPage;
    defaultGetInitialProps(ctx: DocumentContext, options?: {
        nonce?: string;
    }): Promise<DocumentInitialProps>;
};
export type DocumentInitialProps = RenderPageResult & {
    styles?: React.ReactElement[] | Iterable<React.ReactNode> | JSX.Element;
};
export type DocumentProps = DocumentInitialProps & HtmlProps;
/**
 * Next `API` route request
 */
export interface NextApiRequest extends IncomingMessage {
    /**
     * Object of `query` values from url
     */
    query: Partial<{
        [key: string]: string | string[];
    }>;
    /**
     * Object of `cookies` from header
     */
    cookies: Partial<{
        [key: string]: string;
    }>;
    body: any;
    env: Env;
    draftMode?: boolean;
    preview?: boolean;
    /**
     * Preview data set on the request, if any
     * */
    previewData?: PreviewData;
}
/**
 * Send body of response
 */
type Send<T> = (body: T) => void;
/**
 * Next `API` route response
 */
export type NextApiResponse<Data = any> = ServerResponse & {
    /**
     * Send data `any` data in response
     */
    send: Send<Data>;
    /**
     * Send data `json` data in response
     */
    json: Send<Data>;
    status: (statusCode: number) => NextApiResponse<Data>;
    redirect(url: string): NextApiResponse<Data>;
    redirect(status: number, url: string): NextApiResponse<Data>;
    /**
     * Set draft mode
     */
    setDraftMode: (options: {
        enable: boolean;
    }) => NextApiResponse<Data>;
    /**
     * Set preview data for Next.js' prerender mode
     */
    setPreviewData: (data: object | string, options?: {
        /**
         * Specifies the number (in seconds) for the preview session to last for.
         * The given number will be converted to an integer by rounding down.
         * By default, no maximum age is set and the preview session finishes
         * when the client shuts down (browser is closed).
         */
        maxAge?: number;
        /**
         * Specifies the path for the preview session to work under. By default,
         * the path is considered the "default path", i.e., any pages under "/".
         */
        path?: string;
    }) => NextApiResponse<Data>;
    /**
     * Clear preview data for Next.js' prerender mode
     */
    clearPreviewData: (options?: {
        path?: string;
    }) => NextApiResponse<Data>;
    /**
     * Revalidate a specific page and regenerate it using On-Demand Incremental
     * Static Regeneration.
     * The path should be an actual path, not a rewritten path. E.g. for
     * "/blog/[slug]" this should be "/blog/post-1".
     * @link https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration#on-demand-revalidation-with-revalidatepath
     */
    revalidate: (urlPath: string, opts?: {
        unstable_onlyGenerated?: boolean;
    }) => Promise<void>;
};
/**
 * Next `API` route handler
 */
export type NextApiHandler<T = any> = (req: NextApiRequest, res: NextApiResponse<T>) => unknown | Promise<unknown>;
/**
 * Utils
 */
export declare function execOnce<T extends (...args: any[]) => ReturnType<T>>(fn: T): T;
export declare const isAbsoluteUrl: (url: string) => boolean;
export declare function getLocationOrigin(): string;
export declare function getURL(): string;
export declare function getDisplayName<P>(Component: ComponentType<P>): string;
export declare function isResSent(res: ServerResponse): boolean;
export declare function normalizeRepeatedSlashes(url: string): string;
export declare function loadGetInitialProps<C extends BaseContext, IP = {}, P = {}>(App: NextComponentType<C, IP, P>, ctx: C): Promise<IP>;
export declare const SP: boolean;
export declare const ST: boolean;
export declare class DecodeError extends Error {
}
export declare class NormalizeError extends Error {
}
export declare class PageNotFoundError extends Error {
    code: string;
    constructor(page: string);
}
export declare class MissingStaticPage extends Error {
    constructor(page: string, message: string);
}
export declare class MiddlewareNotFoundError extends Error {
    code: string;
    constructor();
}
export interface CacheFs {
    existsSync: typeof fs.existsSync;
    readFile: typeof fs.promises.readFile;
    readFileSync: typeof fs.readFileSync;
    writeFile(f: string, d: any): Promise<void>;
    mkdir(dir: string): Promise<void | string>;
    stat(f: string): Promise<{
        mtime: Date;
    }>;
}
export declare function stringifyError(error: Error): string;
export {};

type State = JSX.Element[] | undefined;
export type SideEffectProps = {
    reduceComponentsToState: <T extends {}>(components: Array<React.ReactElement<any>>, props: T) => State;
    handleStateChange?: (state: State) => void;
    headManager: any;
    inAmpMode?: boolean;
    children: React.ReactNode;
};
export default function SideEffect(props: SideEffectProps): null;
export {};


export declare function createPromiseWithResolvers<T>(): PromiseWithResolvers<T>;
