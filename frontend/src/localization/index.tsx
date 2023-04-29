import { FluentBundle, FluentResource } from "@fluent/bundle";

/**
 * this project now uses Project Fluent for localization
 * https://projectfluent.org/
 * 
 * currently using as a key-value store; not using best practices
 * except for NavBar.tsx and places where logic is necessary
 */

const languages = ['en', 'ja'] as const;
export type Language = typeof languages[number];
export const languageOptions: {[K in Language]: string} = {
  en: 'English',
  ja: '日本語',
};

const globalDefaultLanguage: Language = 'en';
export function getDefaultLanguage(): Language {
  const regionLanguage = window.navigator.language.slice(0, 2).toLowerCase();
  if (regionLanguage in languages) return (regionLanguage as Language)
  return globalDefaultLanguage;
}

const ftl: Record<Language, URL> = {
  en: new URL("./en.ftl", import.meta.url),
  ja: new URL("./ja.ftl", import.meta.url),
};
export async function getBundle(locale: Language): Promise<FluentBundle> {
  let response = await fetch(String(ftl[locale]));
  let messages = await response.text();
  let resource = new FluentResource(messages);
  let bundle = new FluentBundle(locale);
  bundle.addResource(resource);
  return bundle;
}
