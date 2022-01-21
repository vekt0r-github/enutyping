import React, { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";

import { User } from "@/utils/types";

type Props = {
  handleLogin: (code: string|null, state: string|null, oauthprovider: string) => void,
  user: User | null,
}

const Login = ({ handleLogin, user } : Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams, _] = useSearchParams();

  const { oauthprovider } = useParams();

  useEffect(() => {
    const url = window.location.href;
    
    // We redirected back successfully with an access token
    if (url.includes("?code=") && !isLoading && oauthprovider) {
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
      <h1>Login</h1>
      { isLoading ? (
        <p>Loading...</p>
      ): (
        <p>Login options:&nbsp;
          <a href="/api/login/github/request">
            Log in with GitHub
          </a>
        </p>
      )}
    </>
  )
}

export default Login;
