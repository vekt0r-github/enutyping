import styled from 'styled-components';

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { User, Config } from "@/utils/types";
import { kanaRespellings } from "@/utils/kana";
import { MainBox, SubBox } from "@/utils/styles";

const CategoryBox = styled(MainBox)`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	margin: 30px;
	max-width: 100%;
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
};

const settingsPage = ({ user, initConfig, setGlobalConfig }: Props) => {
	if (!user) { // include this in every restricted page
    return <Navigate to='/login' replace={true} />;
  }
	
	const [config, setConfig] = useState<Config>(initConfig); 

	useEffect(() => {
		setGlobalConfig(config);
	}, [config]);
  
	const generateKanaOptions = (() => {

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
  return (
		<>
			<h1>Settings</h1>
			<CategoryBox>
				<h2>Gameplay</h2>
				<SettingContainer>
					<SettingBox>
						<SettingTitle>Global Offset: </SettingTitle>
						<input type="number" value={config.offset} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setConfig({ ...config, offset: parseInt(e.target.value)});}}/>
						<p>If you feel that every map you play is consistently late or early, use this to apply an offset to every map automatically.</p>
					</SettingBox>
					<SettingBox>
						<SettingTitle>Kana Input:</SettingTitle>
						<p>For each of the following kana, choose how you want it to be romanized:</p>
						<KanaContainer>
							{generateKanaOptions}
						</KanaContainer>
					</SettingBox>
				</SettingContainer>
			</CategoryBox>
		</>
  );
};

export default settingsPage;
