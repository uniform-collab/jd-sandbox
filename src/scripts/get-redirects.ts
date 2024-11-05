import { RedirectClient } from '@uniformdev/redirect';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as process from 'process';

(async () => {
  try {
    dotenv.config();
    const client = new RedirectClient({
      apiHost: process.env.UNIFORM_CLI_BASE_URL || 'https://uniform.app',
      apiKey: process.env.UNIFORM_API_KEY,
      projectId: process.env.UNIFORM_PROJECT_ID,
    });

    const ret = [];
    let redirects = (await client.getRedirects({ limit: 50, offset: 0 })).redirects;
    let count = 0;
    while (redirects.length) {
      const redirect = redirects.pop();
      ret.push({
        source: redirect?.redirect.sourceUrl?.replaceAll('/:locale', ''),
        destination: redirect?.redirect.targetUrl?.replaceAll('/:locale', ''),
        permanent: redirect?.redirect.targetStatusCode === 301,
      });
      if (!redirects.length) {
        count++;
        redirects = (await client.getRedirects({ limit: 50, offset: count * 50 })).redirects;
      }
    }
    fs.writeFile('src/context/redirects.json', JSON.stringify(ret, undefined, ' '), e => {
      if (e) {
        console.log(e);
      }
    });
  } catch (e) {
    console.error('pull redirects error:', e);
    return [];
  }
})();
