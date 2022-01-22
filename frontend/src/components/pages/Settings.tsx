import styled from 'styled-components';

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { User, Config } from "@/utils/types";
import { kanaRespellings } from "@/utils/kana";
import { MainBox, SubBox } from "@/utils/styles";
import { post } from "@/utils/functions";

const CategoryBox = styled(MainBox)`
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  margin: 30px;
	margin-bottom: 30px;
  max-width: 80%;
  min-width: 80%;
`;

const CategoryTitle = styled.div`
  min-width: 20%;
`;

const SettingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SettingBox = styled(SubBox)`
  margin: 30px;
`;

const KanaContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const KanaBox = styled.div`
  margin: 30px;
`;

const SettingTitle = styled.span`
  font-weight: bold;
`;


type Props = {
  user: User | null,
  initConfig: Config,
  setGlobalConfig: React.Dispatch<React.SetStateAction<Config>>, 
  yourUser: User | null,
  setYourUser: React.Dispatch<React.SetStateAction<User>>, 
};

const settingsPage = ({ user, yourUser, setYourUser, initConfig, setGlobalConfig }: Props) => {
  if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />;
  }
  
  const [config, setConfig] = useState<Config>(initConfig); 
  
	// Account name change state
  const [requestedName, setRequestedName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    setGlobalConfig(config);
  }, [config]);
  
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
      setErrorMessage("We don't like blank names! Pick something else.");
      return;
    }
    if (/_(osu|github|google)$/.test(requestedName)) {
      setErrorMessage("You sneaky rat! Pick something else.");
      return;
    }
    post('/api/me/changename', { requested_name: requestedName }).then((res) => {
      if (res.success) {
        setYourUser((old) => {
          return {...old, 'name': requestedName }
        });
        setErrorMessage("");
      } else {
        setErrorMessage("Username was taken! Please choose another one.");
      }
      setRequestedName("");
    })
  }

  const editUser = (
    <>
    { (user && yourUser && user.id == yourUser.id) &&
      <>
        <form>
          <label>Requested Name: </label>
          <input value={requestedName}
                 onChange={handleChange}
          />
          <input onClick={handleSubmit} type="button" value="Submit" />
          {errorMessage && <div>{errorMessage}</div>}
        </form>
      </>
    }
    </>
  );
  return (
    <>
      <h1>Settings</h1>
      <CategoryBox>
        <CategoryTitle>
          <h2>General</h2>
        </CategoryTitle>
        <SettingBox>
          <SettingTitle>Metadata Localization: </SettingTitle>
          <select name={"localization"} value={config.localizeMetadata ? "true" : "false"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setConfig({ ...config, localizeMetadata: (e.target.value ==="true") });
          }}>
            <option value={"true"}>Display all song metadata in their Romanized versions (i.e. with the English alphabet)</option>
            <option value={"false"}>Display all song metadata in their original languages</option>
          </select>
        </SettingBox>
      </CategoryBox>
      <CategoryBox>
        <CategoryTitle>
          <h2>Gameplay</h2>
        </CategoryTitle>
        <SettingContainer>
          <SettingBox>
            <SettingTitle>Global Offset: </SettingTitle>
            <input
              type="number"
              defaultValue={config.offset} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const offset = parseInt(e.target.value);
                if (!isNaN(offset)) { setConfig({ ...config, offset: offset }); }
              }}
            />
            <p>If you feel that every map you play is consistently late or early, use this to apply an offset to every map automatically.</p>
          </SettingBox>
          <SettingBox>
            <SettingTitle>Kana Input:</SettingTitle>
            <p>For each of the following kana, choose how you want it to be romanized:</p>
            <KanaContainer>
              {kanaOptions}
            </KanaContainer>
          </SettingBox>
					<SettingBox>
          <SettingTitle>Polygraphic Kana Input:</SettingTitle>
						<select name={"polygraphs"} value={config.typePolygraphs ? "true" : "false"} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
							setConfig({ ...config, typePolygraphs: (e.target.value === "true") });
						}}>
							<option value={"true"}>Enable individual typing of polygraphs</option>
							<option value={"false"}>Disable individual typing of polygraphs</option>
						</select>
            <p>Choose whether you want to be able to type polygraphic kana such as しゃ and っぷ by typing each kana individually. For example, with this setting turned on, you can type しゃ as "sha" or "shixya".</p>
          </SettingBox>
        </SettingContainer>
      </CategoryBox>
      <CategoryBox>
        <CategoryTitle>
          <h2>Account</h2>
        </CategoryTitle>
        <SettingBox>
          <SettingTitle>Change Username</SettingTitle>
					{ editUser }
        </SettingBox>
      </CategoryBox>
    </>
  );
};

export default settingsPage;
