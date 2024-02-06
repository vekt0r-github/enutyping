import React from "react";

import { getL10nFunc } from "@/providers/l10n";

import styled from 'styled-components';
import '@/utils/styles.css'
import { Line } from '@/utils/styles';

/**
 * okay i know this is cursed but basically
 * T can be either BeatmapMetadata or Beatmapset
 * the romanization option asserts that field and field_original
 * are both valid keys of T
 */
type Props<T, F extends string & keyof T> = {
  obj: T,
  set: (field: F) => (value: string) => void
  field: F,
  label: string, // Label: stuff
  description?: string,
  active?: boolean,
  setActive?: (active: boolean) => void,
};

const NewMapContainer = styled.div`
  margin-bottom: var(--s);
`;

const NewMapSubcontainer = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
`;

const NewMapLabel = styled.label<{size: string}>`
  font-size: ${({size}) => size};
  display: inline-block;
  padding-right: var(--s);
  width: 350px;
  box-sizing: border-box;
  text-align: right;
`;

const NewMapInput = styled.input`
  font-size: 1em;
  font-family: "Open Sans";
  width: 200px;
`;

const NewMapDescription = styled(Line)`
  width: fit-content !important;
  position: relative;
  left: 350px;
`;

const FormInput = <T, F extends string & keyof T>({obj, set, field, label, description, active, setActive} : Props<T, F>) => {
  const text = getL10nFunc();
  
  const id = field.replace("_", "-");
  const toRoman = (field : F) => {
    return field.endsWith("_original") ? (field.substring(0, field.length-9) as F) : undefined;
  }
  const roman = toRoman(field);
  const onChange = (field : F) => (e : React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    set(field)(value);
    const roman = toRoman(field);
    if (roman && !active) { set(roman)(value) }
  };
  return (
    <NewMapContainer key={id}>
      <NewMapLabel htmlFor={id} size="1.25em">{text(label)}: </NewMapLabel>
      <NewMapInput
        id={id}
        type="text" 
        value={obj[field] as string}
        onChange={onChange(field)}
      />
      {description ? <NewMapDescription size="0.8em">{text(description)}</NewMapDescription> : null}
      {roman ? <NewMapSubcontainer>
        <NewMapLabel htmlFor={roman} size="1em">{text(`form-map-romanized`, {field: text(label)})}</NewMapLabel>
        <input type="checkbox" checked={active} onChange={(e) => {
          setActive!(e.target.checked);
          set(roman)(obj[field] as string);
        }}></input>
        {active ? 
          <NewMapInput
            id={roman}
            type="text" 
            value={obj[roman] as string}
            onChange={onChange(roman)}
          /> : null}
      </NewMapSubcontainer> : null}
    </NewMapContainer>
  );
}

export default FormInput;