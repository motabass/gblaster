declare module 'lucene-escape-query' {
  function escape(value: string): string;
}
// workaround for offscreencanvas types not working instead
declare type OffscreenCanvas = any;
declare type OffscreenCanvasRenderingContext2D = any;
