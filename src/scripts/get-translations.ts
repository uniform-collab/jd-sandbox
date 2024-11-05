import { ContentClient } from '@uniformdev/canvas';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as process from 'process';
import localizationSettings from '../context/locales.json';

type TranslationEntry = {
  fields: {
    key: {
      value: string;
    };
    value: {
      locales: Record<string, string>;
    };
  };
};

dotenv.config();

(async () => {
  try {
    const { locales: projectLocales } = localizationSettings;
    const client = new ContentClient({
      edgeApiHost: process.env.UNIFORM_CLI_BASE_URL || 'https://uniform.app',
      apiKey: process.env.UNIFORM_API_KEY,
      projectId: process.env.UNIFORM_PROJECT_ID,
    });

    const { entries = [] } = await client?.getEntries({
      type: ['translations'],
    });

    const translations = entries[0];

    const translationsValues = translations?.entry?.fields?.translations?.value as TranslationEntry[];

    const localizationFiles = (translationsValues || []).reduce<Record<string, object>>((acc, curr) => {
      const { key, value } = curr?.fields || {};
      const translationKey = key?.value;
      const translationValue = value?.locales || {};

      const localizedTranslations = Object.entries(translationValue).reduce(
        (acc, [locale, value]) => ({ ...acc, [locale]: value }),
        {}
      );

      return Object.entries(localizedTranslations).reduce<Record<string, object>>(
        (acc, [locale, value]) => ({
          ...acc,
          [locale]: {
            ...acc[locale],
            [translationKey]: value,
          },
        }),
        acc
      );
    }, {});

    const locales = Object.keys(localizationFiles);

    const isAllLocalesPresent = projectLocales.every(locale => locales.includes(locale));

    if (!isAllLocalesPresent) {
      console.error('Not all locales are present in the project');
    }

    Object.entries(localizationFiles).forEach(([locale, translations]) => {
      fs.writeFileSync(`./src/locales/${locale}.json`, JSON.stringify(translations, null, 2));
    });
  } catch (e) {
    console.error(e);
  }
})();
