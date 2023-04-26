// following guide from https://hco.medium.com/create-a-multi-language-website-with-react-context-api-10f9544bee09

import en from './en.json';
import ja from './ja.json';

const languages = ['en', 'ja'] as const;
export type Language = typeof languages[number];
export const dictionaryList: {[K in Language]: {[tid: string]: string}} = {
  en,
  ja,
};
export const languageOptions: {[K in Language]: string} = {
  en: 'English',
  ja: 'Japanese',
};

const globalDefaultLanguage: Language = 'en';
export function getDefaultLanguage (): Language {
  const regionLanguage = window.navigator.language.slice(0, 2).toLowerCase();
  if (regionLanguage in languages) return (regionLanguage as Language)
  return globalDefaultLanguage;
}