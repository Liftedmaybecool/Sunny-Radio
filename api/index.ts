import app, { initServer } from '../server.js';

export default async function handler(req: any, res: any) {
  await initServer();
  return app(req, res);
}
