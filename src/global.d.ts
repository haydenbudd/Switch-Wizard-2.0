/** Build-time flag injected by vite.config.wordpress.ts via `define`. */
declare const __LM_EMBED_MODE__: boolean | undefined;

/** Vite `?inline` asset import — returns a base64 data URI string. */
declare module '*.png?inline' {
  const dataUri: string;
  export default dataUri;
}
