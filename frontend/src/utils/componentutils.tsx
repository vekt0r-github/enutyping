import React from "react";
import { useParams } from "react-router-dom";

import { BoldSpan, InputContainer } from '@/utils/styles';

export const withParamsAsKey = <Props extends object>(WrappedComponent : React.ComponentType<Props>) : React.FC<Props> => 
  (props : Props) => {
    const params = useParams();
    return (
      <WrappedComponent
        key={Object.values(params).join('-')}
        {...props as Props}
      />
    );
  };

export const withLabel = (el: JSX.Element, id: string, label: string) => 
  <InputContainer>
    <label htmlFor={id}><BoldSpan>{label}</BoldSpan></label>
    {React.cloneElement(el, { id })}
  </InputContainer>