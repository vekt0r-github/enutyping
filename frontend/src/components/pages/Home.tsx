import React, { Component } from "react";

import NavBar from "../modules/NavBar";

interface User { // example
  name: string;
  age: number;
}

class Home extends Component {
  constructor(props : User) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <NavBar />
    );
  }
}

export default Home;