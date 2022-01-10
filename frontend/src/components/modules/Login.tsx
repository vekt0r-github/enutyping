import React, { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

const Login = ({ handleLogin, handleLogout, user }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams, _] = useSearchParams();

  useEffect(() => {
    const url = window.location.href;
    
    // We redirected back successfully with an access token
    if (url.includes("?code=") && !isLoading) {
      setIsLoading(true);
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      handleLogin(code, state);
    }
  }, [isLoading, user]);

  if (user) {
    return <Navigate to="/" replace={true} />
  }

  return (
    <>
      { isLoading ? (
        <p>Loading...</p>
      ): (
        <p>You are not logged in.&nbsp;
          <a href="/api/login">
            Login here!
          </a>
        </p>
      )}
    </>
  )
}

export default Login;
