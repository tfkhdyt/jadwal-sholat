import express from 'express';
import process from 'process';
import { createRequestHandler } from '@remix-run/express';
import { installGlobals } from '@remix-run/node';

installGlobals();

let { PORT, NODE_ENV } = process.env;
PORT ??= 3000;

const viteDevServer =
  NODE_ENV === 'production'
    ? undefined
    : await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const app = express();

if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  app.use(
    '/assets',
    express.static('./build/client/assets', {
      immutable: true,
      maxAge: '1y',
    })
  );
}
app.use(express.static('./build/client', { maxAge: '1h' }));

app.all(
  '*',
  createRequestHandler({
    build: viteDevServer
      ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
      : await import('./build/server/index.js'),
  })
);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
