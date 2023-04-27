import styled from 'styled-components';

import React, { useContext, useState } from "react";
import { Navigate } from "react-router-dom";

import { Language, languageOptions } from '@/localization';

import { configContext, setConfigContext } from '@/providers/config';
import { getLocalizationFunc } from '@/providers/l10n';

import { User } from "@/utils/types";
import { kanaRespellings } from "@/utils/kana";
import { MainBox, SubBox } from "@/utils/styles";
import { post } from "@/utils/functions";

const CategoryBox = styled(MainBox)`
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  margin: 30px;
  max-width: 1200px;
  min-width: 1200px;
`;

const CategoryTitle = styled.div`
  padding-left: 2em;
  min-width: 20%;
`;

const SettingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SettingBox = styled(SubBox)`
  margin: var(--m);
`;

const KanaContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const KanaBox = styled.div`
  margin: var(--s);
`;

const SettingTitle = styled.span`
  font-weight: bold;
`;

const ChangeNameBox = styled.div`
  display: flex;
  align-items: center;
`;

const NameSuccessMessage = styled.div`
  color: var(--green);
`;

const NameErrorMessage = styled.div`
  color: var(--red);
`;

type Props = {
  user: User | null,
  yourUser: User | null, // if theoretically you could view this page for different users?? idk
  setYourUser: React.Dispatch<React.SetStateAction<User | null | undefined>>, // for changing name
};

enum MessageType { SUCCESS, ERROR };
const { SUCCESS, ERROR } = MessageType;
type Message = {
  type: MessageType,
  message: string,
}

const SettingsPage = ({ user, yourUser, setYourUser }: Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />;
  }
  const config = useContext(configContext);
  const setConfig = useContext(setConfigContext);
  const t = getLocalizationFunc();
  
  // Account name change state
  const [requestedName, setRequestedName] = useState<string>("");
  const [message, setMessage] = useState<Message>({type: SUCCESS, message: ""});

  const kanaOptions = (() => {

    let kanaSelect: JSX.Element[] = [];
    let key: keyof typeof kanaRespellings;
    for(key in kanaRespellings) {
      const value = kanaRespellings[key];
      const options = value.map((romanization: string) => (
        <option value={romanization} key={romanization}>{romanization}</option>
      ));
      kanaSelect.push(
        <KanaBox key={key}>
          <span>{key + ": "}</span>
          <select name={key} value={config.kanaSpellings[key]} onChange={((kana: typeof key) => (e: React.ChangeEvent<HTMLSelectElement>) => {setConfig({ 
            ...config, 
            kanaSpellings: { ...config.kanaSpellings, [kana]: e.target.value},
          })})(key)}>
            {options}
          </select>
        </KanaBox>
      );
    }
    return kanaSelect;
  })();

  // TODO: Possible refactor but fuck this right now with shared form hooks
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRequestedName(event.target.value);
  }
  const handleSubmit = () => {
    if (!requestedName) {
      setMessage({
        type: ERROR,
        message: t(`settings-error-name-blank`),
      });
      return;
    }
    if (/_(osu|github|google)$/.test(requestedName)) {
      setMessage({
        type: ERROR,
        message: t(`settings-error-name-bad`),
      });
      return;
    }
    post('/api/me/changename', { requested_name: requestedName }).then((res) => {
      if (res.success) {
        setYourUser((old) => {
          if (old) {
            return {...old, 'name': requestedName }
          }
        });
        setMessage({
          type: SUCCESS,
          message: t(`settings-success`),
        });
      } else {
        setMessage({
          type: ERROR,
          message: t(`settings-error-name-taken`),
        });
      }
      setRequestedName("");
    })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  const editUser = (
    <>
    { (user && yourUser && user.id == yourUser.id) &&
      <>
        <ChangeNameBox>
            <label>{t(`settings-name-change-prompt`)}</label>
            <input value={requestedName}
                   onChange={handleChange}
                   onKeyDown={handleKeyDown}
            />
            <input onClick={handleSubmit} type="button" value="Submit" />
        </ChangeNameBox>
        {message.type === SUCCESS && <NameSuccessMessage>{message.message}</NameSuccessMessage>}
        {(message.message && message.type === ERROR) && <NameErrorMessage>{message.message}</NameErrorMessage>}
      </>
    }
    </>
  );
  return (
    <>
      <h1>{t(`settings`)}</h1>
      <CategoryBox>
        <CategoryTitle>
          <h2>{t(`settings-category-general`)}</h2>
        </CategoryTitle>
        <SettingBox>
          <SettingTitle>{t(`settings-site-language`)}</SettingTitle>
          <select name={"localization"} value={config.language} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            // setConfig({ ...config, language: (e.target.value as Language) });
            setConfig((config) => ({...config, language: e.target.value as Language}));
          }}>
            {Object.entries(languageOptions).map(([lang, label]) => <option value={lang}>{label}</option>)}
          </select>
        </SettingBox>
        <SettingBox>
          <SettingTitle>{t(`settings-metadata-localization`)}</SettingTitle>
          <select name={"localization"} value={config.localizeMetadata ? "true" : "false"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setConfig({ ...config, localizeMetadata: (e.target.value ==="true") });
          }}>
            <option value={"true"}>{t(`settings-metadata-localization-true`)}</option>
            <option value={"false"}>{t(`settings-metadata-localization-false`)}</option>
          </select>
        </SettingBox>
      </CategoryBox>
      <CategoryBox>
        <CategoryTitle>
          <h2>{t(`settings-category-gameplay`)}</h2>
        </CategoryTitle>
        <SettingContainer>
          <SettingBox>
            <SettingTitle>{t(`settings-global-offset`)}</SettingTitle>
            <input
              type="number"
              defaultValue={config.offset} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const offset = parseInt(e.target.value);
                if (!isNaN(offset)) { setConfig({ ...config, offset: offset }); }
              }}
            />ms
            <p>{t(`settings-global-offset-desc`)}</p>
          </SettingBox>
          <SettingBox>
            <SettingTitle>{t(`settings-kana-input`)}</SettingTitle>
            <p>{t(`settings-kana-input-desc`)}</p>
            <KanaContainer>
              {kanaOptions}
            </KanaContainer>
          </SettingBox>
          <SettingBox>
          <SettingTitle>{t(`settings-polygraphic-kana-input`)}</SettingTitle>
            <select name={"polygraphs"} value={config.typePolygraphs ? "true" : "false"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setConfig({ ...config, typePolygraphs: (e.target.value === "true") });
            }}>
              <option value={"true"}>{t(`settings-polygraphic-kana-input-true`)}</option>
              <option value={"false"}>{t(`settings-polygraphic-kana-input-false`)}</option>
            </select>
            <p>{t(`settings-polygraphic-kana-input-desc`)}</p>
          </SettingBox>
        </SettingContainer>
      </CategoryBox>
      <CategoryBox>
        <CategoryTitle>
          <h2>{t(`settings-category-account`)}</h2>
        </CategoryTitle>
        <SettingBox>
          <SettingTitle>{t(`settings-name-change`)}</SettingTitle>
          { editUser }
        </SettingBox>
      </CategoryBox>
    </>
  );
};

export default SettingsPage;
