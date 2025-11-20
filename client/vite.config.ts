import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Custom plugin to handle URI malformed errors at the Vite level
const handleUriErrorsPlugin = (): Plugin => {
  return {
    name: 'handle-uri-errors',
    configureServer(server) {
      // Intercept transform requests to catch URI errors
      const originalTransformRequest = server.transformRequest;
      
      server.transformRequest = async (url, options) => {
        try {
          // Validate URL before processing
          if (url && typeof url === 'string') {
            // Check for malformed URI patterns
            if (url.includes('%') && !/^%[0-9A-F]{2}$/i.test(url.match(/%[0-9A-F]{0,2}/)?.[0] || '')) {
              // Malformed percent encoding detected
              console.warn(`[Vite] Detected potentially malformed URL: ${url.substring(0, 100)}`);
              // Try to sanitize the URL
              try {
                decodeURIComponent(url);
              } catch {
                // If decode fails, return null to skip processing
                console.warn(`[Vite] Skipping malformed URL: ${url.substring(0, 100)}`);
                return null;
              }
            }
          }
          
          return await originalTransformRequest.call(server, url, options);
        } catch (error: any) {
          // Suppress URI malformed errors
          if (error?.message?.includes('URI malformed') || 
              error?.message?.includes('decodeURI') ||
              error?.code === 'ERR_INVALID_URL' ||
              error?.name === 'URIError') {
            console.warn(`[Vite] Suppressed URI error for: ${url?.substring?.(0, 100) || 'unknown'}`);
            return null;
          }
          throw error;
        }
      };

      // Wrap middleware to catch errors
      const originalUse = server.middlewares.use.bind(server.middlewares);
      
      server.middlewares.use = function(middlewarePath: string | Function, ...handlers: Function[]) {
        if (typeof middlewarePath === 'function') {
          handlers = [middlewarePath, ...handlers];
          middlewarePath = '/';
        }
        
        const wrappedHandlers = handlers.map(handler => {
          return (req: any, res: any, next: any) => {
            try {
              // Validate request URL
              if (req.url) {
                try {
                  decodeURI(req.url);
                } catch (uriError: any) {
                  // Malformed URI in request
                  console.warn(`[Vite] Malformed request URL: ${req.url?.substring(0, 100)}`);
                  if (!res.headersSent) {
                    res.statusCode = 400;
                    res.end('Bad Request - Invalid URL');
                  }
                  return;
                }
              }
              
              return handler(req, res, next);
            } catch (error: any) {
              // Suppress URI malformed errors
              if (error?.message?.includes('URI malformed') || 
                  error?.message?.includes('decodeURI') ||
                  error?.code === 'ERR_INVALID_URL' ||
                  error?.name === 'URIError') {
                console.warn(`[Vite] Suppressed URI error in middleware: ${error.message}`);
                if (!res.headersSent) {
                  res.statusCode = 400;
                  res.end('Bad Request');
                }
                return;
              }
              next(error);
            }
          };
        });
        
        return originalUse(middlewarePath, ...wrappedHandlers);
      };
    },
  };
};

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to handle URI errors - must be first
    handleUriErrorsPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3001,
    hmr: {
      overlay: false, // Disable Vite overlay completely
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // Suppress errors in console
  logLevel: 'warn',
  clearScreen: false,
  // Optimize dependencies to prevent issues
  optimizeDeps: {
    exclude: [],
  },
});
