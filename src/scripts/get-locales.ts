import { LocaleClient, LocalesGetResponse } from '@uniformdev/canvas';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as process from 'process';

type LocalizationSettings = {
  locales: string[];
  localeNames: { [key: string]: string };
  defaultLocale?: string;
};

(async () => {
  try {
    dotenv.config();
    const client = new LocaleClient({
      apiHost: process.env.UNIFORM_CLI_BASE_URL || 'https://uniform.app',
      apiKey: process.env.UNIFORM_API_KEY,
      projectId: process.env.UNIFORM_PROJECT_ID,
    });

    const localeResponse: LocalesGetResponse = await client.get();

    const { results: localeDefinitions } = localeResponse;

    const localizationSettings = localeDefinitions?.reduce<LocalizationSettings>(
      (acc, l) => {
        acc.locales.push(l.locale);
        acc.localeNames[l.locale] = l.displayName;
        if (l.isDefault) {
          acc.defaultLocale = l.locale;
        }
        return acc;
      },
      {
        locales: [],
        localeNames: {},
        defaultLocale: undefined,
      }
    );
    fs.writeFile('src/context/locales.json', JSON.stringify(localizationSettings, undefined, ' '), e => {
      if (e) {
        console.log(e);
      }
    });
  } catch (e) {
    console.error('pull locales error:', e);
    return {
      locales: [],
      localeNames: {},
      defaultLocale: undefined,
    };
  }
})();
