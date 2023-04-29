/**
 * defines the config context and provider
 */
import React, { useState, useEffect, createContext, useContext } from 'react';

import { Language, getDefaultLanguage, languageOptions } from "@/localization";

export type Config = {
  volume: number;
  offset: number;
  language: Language;
  localizeMetadata: boolean;
  typePolygraphs: boolean;
  kanaSpellings: {
    し: string,
    ち: string,
    つ: string,
    じ: string,
    しゃ: string,
    しょ: string,
    しゅ: string,
    じゃ: string,
    じょ: string,
    じゅ: string,
    か: string, 
    く: string, 
    こ: string, 
    せ: string, 
    ふ: string, 
    づ: string,
    ん: string, 
  };
};

export const defaultConfig = (): Config => ({
  volume: 1.0,
  offset: 0,
  language: getDefaultLanguage(), // shouldn't matter when this runs
  localizeMetadata: false,
  typePolygraphs: true,
  kanaSpellings: {
    し: "shi", 
    ち: "chi",
    つ: "tsu",
    じ: "ji",
    しゃ: "sha",
    しょ: "sho",
    しゅ: "shu",
    じゃ: "ja",
    じょ: "jo",
    じゅ: "ju",
    か: "ka", 
    く: "ku", 
    こ: "ko", 
    せ: "se",
    ふ: "fu", 
    づ: "du",
    ん: "n", 
  },
});

// create the language context with default selected language
// will be initialized in provider
export const configContext = createContext<Config>(defaultConfig());
export const setConfigContext = createContext<(config: React.SetStateAction<Config>) => void>(() => {});

type ConfigProviderProps = {
  children: JSX.Element // or soemthing
}

// it provides the language context to app
// all of this should be able to be merged with settings somehow eventually
export function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfig] = useState(defaultConfig());

  useEffect(() => {
    const localConfig: string | null = window.localStorage.getItem('enutyping-config');
    if(localConfig) {
      setConfig({ ...config, ...JSON.parse(localConfig) });
    }
  }, []);

  useEffect(() => {
    console.log(config)
    window.localStorage.setItem('enutyping-config', JSON.stringify(config));
  }, [config]);
  

  return (
    <configContext.Provider value={config}>
      <setConfigContext.Provider value={setConfig}>
        {children}
      </setConfigContext.Provider>
    </configContext.Provider>
  );
};
