/**
 * Type declarations for pdfkit
 * pdfkit doesn't have official TypeScript types, so we declare them here
 */
declare module 'pdfkit' {
  interface PDFDocumentOptions {
    size?: string | [number, number];
    margins?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
  }

  export default class PDFDocument {
    constructor(options?: PDFDocumentOptions);
    
    on(event: 'data' | 'end' | 'error', callback: (...args: any[]) => void): void;
    
    rect(x: number, y: number, w: number, h: number): PDFDocument;
    fill(color?: string): PDFDocument;
    stroke(color?: string): PDFDocument;
    lineWidth(width: number): PDFDocument;
    fillColor(color: string): PDFDocument;
    strokeColor(color: string): PDFDocument;
    opacity(value: number): PDFDocument;
    fontSize(size: number): PDFDocument;
    font(name: string): PDFDocument;
    text(text: string, options?: {
      align?: 'left' | 'center' | 'right' | 'justify';
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    }): PDFDocument;
    circle(x: number, y: number, radius: number): PDFDocument;
    moveTo(x: number, y: number): PDFDocument;
    lineTo(x: number, y: number): PDFDocument;
    end(): void;
    
    page: {
      width: number;
      height: number;
    };
  }
}

