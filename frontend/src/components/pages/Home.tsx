import React, { Component } from "react";
import { Navigate } from "react-router-dom";

import { User } from "../App";

type Props = {
  user: User,
};

type State = {};

class Home extends Component<Props, State> {
  constructor(props : Props) {
    super(props);
    this.state = {};
  }

  render() {
    const user = this.props.user;
    if (!user) {
      return <Navigate to='/login' replace={true} />
    }
    return (
      <>
        <p>You are logged in as {user.name} with id {user.id}</p>
      </>
    );
  }
}

export default Home;
