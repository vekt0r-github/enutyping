import React, { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";

import Loading from "@/components/modules/Loading";
import OAuthButton from "@/components/modules/OAuthButton";

import { getL10nFunc } from "@/providers/l10n";

import { User } from "@/utils/types";
import { withParamsAsKey } from "@/utils/componentutils";

import GoogleSVG from "@/public/images/google_logo.svg"
import GithubSVG from "@/public/images/github-mark.svg"
import OsuSVG from "@/public/images/osu_logo.svg"
import styled from "styled-components";

type Props = {
  handleLogin: (code: string|null, state: string|null, oauthprovider: string) => void,
  user: User | null,
}

const Container = styled.div`
  align-items: left;
`

const Login = ({ handleLogin, user } : Props) => {
  const text = getL10nFunc();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams, _] = useSearchParams();

  const { oauthprovider } = useParams();

  useEffect(() => {
    const url = window.location.href;
    
    // We redirected back successfully with an access token
    if (url.includes("code=") && !isLoading && oauthprovider) {
      setIsLoading(true);
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      handleLogin(code, state, oauthprovider);
    }
  }, [isLoading, user]);

  if (user) {
    return <Navigate to="/" replace={true} />
  }

  return (
    <>
      <h1>{text(`login-header`)}</h1>
      { isLoading ? <Loading />: (
        <Container>
          <OAuthButton text="Sign in with Github" link="/api/login/github/request" svgUrl={GithubSVG} width={45} />
          <OAuthButton text="Sign in with Google" link="/api/login/google/request" svgUrl={GoogleSVG} width={45} />
          <OAuthButton text="Sign in with osu!" link="/api/login/osu/request" svgUrl={OsuSVG} width={50} />
        </Container>
      )}
    </>
  )
}

export default withParamsAsKey(Login);
