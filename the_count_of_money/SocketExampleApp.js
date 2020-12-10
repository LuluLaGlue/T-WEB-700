import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";

import { Provider } from "react-redux";

// J'ai mis bootstrap juste pour le debut mais on peux aller sur
// Material design apres si tu prefere
import "bootstrap/dist/css/bootstrap.min.css";

import store from "./store";

import Home from "./components/core/home";
import Register from "./components/auth/register.component";
import Login from "./components/auth/login.component";
import Settings from "./components/auth/settings.component";
import PrivateRoute from "./components/private-route/privateRoute";
import Dashboard from "./components/dashboard/dashboard";
import Admin from "./components/admin/admin";
import Press from "./components/Press/Press";
import Navbar from "./components/shared/navbar.component";

import "./App.css";

import io from 'socket.io-client'
var socket;

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
      endpoint: process.env.ENDPOINT_SOCKET,
      datas: [],
      socket: 0,
      user: '',
      cryptos: [],
      cryptoInput: 'Test',
    };
    socket = io(this.state.endpoint);
    this.handleChange = this.handleChange.bind(this);
  }

  getData = cryptos => {
    console.log(cryptos);
    this.setState({ datas: cryptos.list });
  };

  setCrypto = cryptos => {
    console.log(cryptos);
    this.setState({datas : cryptos.list});
  };

  setArrayPeriod = cryptos => {
    console.log(cryptos);
    this.setState({datas : cryptos.list});
  };

  handleChange(event) {
    this.setState({cryptoInput: event.target.value});
    if (event.target.value.length > 2){
      socket.emit("ask_search", event.target.value)
    }
    console.log(this.state.cryptos)
  }

  /*As soon as the component gets mounted ie in componentDidMount method, firing the initial_data event to get the data to initialize the Kitchen Dashboard */
  /* Adding change_data listener for listening to any changes made by Place Order and Predicted Order components*/
  componentDidMount() {
    var state_current = this;

    socket.emit("connection", {token: undefined})
    //socket.on("send_cryptos", this.getData)
    socket.on("refresh_cryptos", this.getData)
    socket.on("get_search", this.setCrypto)
    socket.on("send_period", this.setArrayPeriod)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.user !== this.state.user){
      //socket.emit("connection", {token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYzMwMDZjODQzMjUxZDQ4ZWFhYWI2MiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYwNzIxNzAwMSwiZXhwIjoxNjA3ODIxODAxfQ.0UBmHTCvRv7YNLKboYpgyFfHi13zm7FQNfsSRqwzu5w'});
      socket.emit("request_period", {token:jwt_token, crypto_id:'btc', period:'last_24h', rate:'euro'})
    }
  }

/* Removing the listener before unmounting the component in order to avoid addition of multiple listener at the time revisit*/
  componentWillUnmount() {
      socket.off("connection");
      socket.off("send_cryptos");
      socket.off("refresh_cryptos")
      socket.off("add_crypto");
      socket.off("remove_crypto");
      socket.off("request_crypto");
      socket.off("request_period");
    }
    /* When Done gets clicked, this function is called and mark_done event gets emitted which gets listened on the backend explained later on*/
    markDone = id => {
    // console.log(predicted_details);
    socket.emit("mark_done", id);
  };

  render() {
    return (
      <Provider store={store}>
        <Router>
          <Navbar />
          <Route exact path="/" component={() => <Home datas={this.state.datas} />} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/press" component={Press} />
          <button onClick={() => this.setState({user: 'oui'})}>Click here</button>
          <span>{this.state.user}</span>
          <label>
            Search :
            <input value={this.state.cryptoInput} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Envoyer" />
          <Switch>
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <PrivateRoute exact path="/settings" component={Settings} />
            <PrivateRoute exact path="/admin" component={Admin} />
          </Switch>
        </Router>
      </Provider>
    );
  }
}

export default App;
