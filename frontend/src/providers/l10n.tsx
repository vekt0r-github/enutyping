import React, { Children, useEffect, useState, ReactNode, useContext } from "react";
import { ReactLocalization, LocalizationProvider, useLocalization } from "@fluent/react";

import { getBundle } from "@/localization";
import { configContext } from "@/providers/config";

interface AppLocalizationProviderProps {
  children: ReactNode;
}

export function AppLocalizationProvider(props: AppLocalizationProviderProps) {
  const config = useContext(configContext);
  const [l10n, setL10n] = useState<ReactLocalization | null>(null);

  useEffect(() => {
    getBundle(config.language).then((bundle) => {
      setL10n(new ReactLocalization([bundle]));
    });
  }, [config.language]);

  if (l10n === null) {
    return <div>Loading…</div>; // can't pick a language to show loading in
  }

  return (
    <LocalizationProvider l10n={l10n}>
      {Children.only(props.children)}
    </LocalizationProvider>
  );
};

export type L10nFunc = ReactLocalization["getString"];
export type L10nElementFunc = ReactLocalization["getElement"];

export const getL10nFunc = () : L10nFunc => {
  const { l10n } = useLocalization();
  return l10n.getString.bind(l10n);
};

export const getL10nElementFunc = () : L10nElementFunc => {
  const { l10n } = useLocalization();
  return l10n.getElement.bind(l10n);
};