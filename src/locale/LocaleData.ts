import texts from './texts.json';

interface LocaleData {
  he: any,
  en: any,
  ru: any,
  ar: any,
  am: any
}

const localeData: LocaleData = { he: texts.he, en: texts.en, ru: texts.ru, ar: texts.ar, am: texts.am };

export default localeData;
