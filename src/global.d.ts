/** Vite `?inline` asset import — returns a base64 data URI string. */
declare module '*.png?inline' {
  const dataUri: string;
  export default dataUri;
}
