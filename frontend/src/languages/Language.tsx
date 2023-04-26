// following guide from https://hco.medium.com/create-a-multi-language-website-with-react-context-api-10f9544bee09

import en from './en.json';
import ja from './ja.json';

const languages = ['en', 'ja'] as const;
export type Language = typeof languages[number];
const globalDefaultLanguage: Language = 'en';
export const dictionaryList: {[K in Language]: {[tid: string]: string}} = {
  en,
  ja,
};
export const languageOptions: {[K in Language]: string} = {
  en: 'English',
  ja: 'Japanese',
};
export function getDefaultLanguage (): Language {
  const savedLanguage = window.localStorage.getItem('enutyping-lang');
  if (savedLanguage) return (savedLanguage as Language);
  const regionLanguage = window.navigator.language.slice(0, 2);
  if (regionLanguage in languages) return (regionLanguage as Language)
  return globalDefaultLanguage;
}

import React, { useState, createContext, useContext } from 'react';

// create the language context with default selected language
export const LanguageContext = createContext({
  userLanguage: 'en',
  dictionary: dictionaryList.en,
  userLanguageChange: (selected: Language) => {},
});

type LanguageProviderProps = {
  children: JSX.Element // or soemthing
}

// it provides the language context to app
// all of this should be able to be merged with settings somehow eventually
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [userLanguage, setUserLanguage] = useState(getDefaultLanguage());

  const provider = {
    userLanguage,
    dictionary: dictionaryList[userLanguage],
    userLanguageChange: (selected: Language) => {
      const newLanguage = languageOptions[selected] ? selected : 'en'
      setUserLanguage(newLanguage);
      window.localStorage.setItem('enutyping-lang', newLanguage);
    }
  };

  return (
    <LanguageContext.Provider value={provider}>
      {children}
    </LanguageContext.Provider>
  );
};

// get text according to id & current language
export function Text([tid]: TemplateStringsArray) {
  const languageContext = useContext(LanguageContext);
  console.log(languageContext)
  return languageContext.dictionary[tid] || tid;
};
