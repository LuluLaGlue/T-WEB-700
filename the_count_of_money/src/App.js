import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";

import { Provider } from "react-redux";

import "bootstrap/dist/css/bootstrap.min.css";

import store from "./store";

import Register from "./components/auth/register";
import Login from "./components/auth/login";
import Settings from "./components/auth/settings";
import PrivateRoute from "./components/private-route/privateRoute";
import CryptoList from "./components/crypto/listCrypto";
import AddCrypto from "./components/crypto/addCrypto";
import DetailCrypto from "./components/crypto/detailCrypto";
import DeleteCrypto from "./components/crypto/deleteCrypto";
import Press from "./components/Press/Press";
import NavbarSite from "./components/shared/navbar";
import "./App.css";
import io from "socket.io-client";

let socket;

// Check for token to keep user logged in
if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);

  // Decode token and get user info and exp
  const decoded = jwt_decode(token);

  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));

  // Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds

  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());

    // Redirect to login
    window.location.href = "./login";
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      endpoint: process.env.REACT_APP_ENDPOINT,
      datas: [],
      followed: [],
    };
    socket = io(this.state.endpoint);
  }
  setCrypto = (cryptos) => {
    console.log(cryptos);
    if (cryptos.list.followed) {
      this.setState({
        datas: cryptos.list.else,
        followed: cryptos.list.followed,
      });
    } else {
      this.setState({ datas: cryptos.list });
    }
  };

  componentDidMount() {
    let state_current = this;
    socket.emit("connection", {
      token: localStorage.getItem("jwtToken"),
    });
    socket.on("send_cryptos", this.setCrypto);
    socket.on("refresh_cryptos", this.setCrypto);
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    socket.off("connection");
    socket.off("send_cryptos");
  }
  /* When Done gets clicked, this function is called and mark_done event gets emitted which gets listened on the backend explained later on*/
  markDone = (id) => {
    // console.log(predicted_details);
    socket.emit("mark_done", id);
  };

  render() {
    return (
      <Provider store={store}>
        <Router>
          <NavbarSite />
          <Route
            exact
            path="/"
            component={() => (
              <CryptoList
                datas={this.state.datas}
                followed={this.state.followed}
              />
            )}
          />

          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/press" component={Press} />
          <Route path="/detail/:id" render={(props) => <DetailCrypto socket={socket} {...props} />}/>
          <Switch>
            <PrivateRoute exact path="/settings" component={Settings} />
            <PrivateRoute exact path="/add" component={AddCrypto} />
            <PrivateRoute path="/delete/:id" component={DeleteCrypto} />
          </Switch>
        </Router>
      </Provider>
    );
  }
}

export default App;
