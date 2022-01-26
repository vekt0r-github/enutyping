import React from "react";
import { useParams } from "react-router-dom";

export const withParamsAsKey = <Props extends object>(WrappedComponent : React.ComponentType<Props>) : React.FC<Props> => 
  (props : Props) => {
    const params = useParams();
    console.log(params)
    return (
      <WrappedComponent
        key={Object.values(params).join('-')}
        {...props as Props}
      />
    );
  };