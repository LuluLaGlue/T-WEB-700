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
import Admin from "./components/admin/admin";

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
      searchedList: [],
      requestedList: [],
      input: '',
      request: '',
      buttonDisabled: true,
      button2Disabled: true,
    };
    socket = io(this.state.endpoint);
    this.method = this.method.bind(this);
    this.handleChange = this.handleChange.bind(this)
    this.handleRequest = this.handleRequest.bind(this)
  }
  method(e) {
    e.preventDefault();
  }

  handleChange = (event) => {
    this.setState({buttonDisabled:true})
    this.setState({input:event.target.value})
    if (event.target.value.length>2){
      socket.emit("ask_authorized", event.target.value)
    }
  }

  handleRequest = (event) => {
    this.setState({button2Disabled:true})
    this.setState({request:event.target.value})
    if (event.target.value.length>2){
      socket.emit("ask_search", event.target.value)
    }
  }

  addCrypto = (event) => {
    socket.emit("add_crypto", {crypto_id:this.state.input, token:localStorage.getItem("jwtToken")})
  }

  requestCrypto = (event) => {
    socket.emit("request_crypto", {crypto_id:this.state.request, token:localStorage.getItem("jwtToken")})
  }

  setCrypto = (cryptos) => {
    if (cryptos.followed) {
      this.setState({
        datas: cryptos.list,
        followed: cryptos.followed
      });
    } else {
      this.setState({ datas: cryptos.list, followed: [] });
    }
  };

  setRequest = (cryptos) => {
    this.setState({ requestedList: cryptos.list})
    if (cryptos.list.length > 0 && this.state.request.length > 2){
      console.log(this.state.requestedList, this.state.request)
      for (let i=0;i<cryptos.list.length; i++){
        if(this.state.request === cryptos.list[i].id){
          this.setState({button2Disabled:false})
          break;
        }
        else this.setState({button2Disabled:true})
      }
    }
    else this.setState({button2Disabled:true})
  }

  setSearched = (cryptos) => {
    this.setState({ searchedList: cryptos.list})
    if (cryptos.list.length > 0 && this.state.input.length > 2){
      for (let i=0;i<cryptos.list.length; i++){
        if(this.state.input === cryptos.list[i].id){
          this.setState({buttonDisabled:false})
          break;
        }
        else this.setState({buttonDisabled:true})
      }
    }
    else this.setState({buttonDisabled:true})
  }

  componentDidMount() {
    let state_current = this;
    if (localStorage.getItem("jwtToken") !== null){
      socket.emit("connection", {
        token: localStorage.getItem("jwtToken"),
        rates: 'eur'
      });
    }
    else {
      socket.emit("connection", {
        token: 'undefined',
        rates: 'eur'
      });
    }
    socket.on("send_cryptos", this.setCrypto);
    socket.on("refresh_cryptos", this.setCrypto);
    socket.on("get_search", this.setSearched)
    socket.on("get_request", this.setRequest)
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    socket.off("connection");
    socket.off("send_cryptos");
    socket.off("refresh_cryptos");
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
          <NavbarSite socket={socket}/>
          { window.location.pathname === '/' && localStorage.getItem("jwtToken") !== null ?
            <React.Fragment>
              <span className="add_crypto">Add cryptos to your favorites</span>
              <input list="dlist" name="cryptos" onChange={this.handleChange}/><button onClick={this.addCrypto} disabled={this.state.buttonDisabled}>Add</button>
              <datalist id="dlist">
                {this.state.searchedList.map((currentCrypto) => {
                  return (
                     <option value={currentCrypto.id} key={currentCrypto.id}>{currentCrypto.symbol}</option>
                  )})
                }
              </datalist>
                  <span className="add_crypto">Ask the admin to authorize cryptos</span>
                  <input list="rlist" name="cryptos" onChange={this.handleRequest}/><button onClick={this.requestCrypto} disabled={this.state.button2Disabled}>Add</button>
                  <datalist id="rlist">
                    {this.state.requestedList.map((currentCrypto) => {
                      return (
                         <option value={currentCrypto.id} key={currentCrypto.id}>{currentCrypto.symbol}</option>
                      )})
                    }
                  </datalist>
            </React.Fragment>
            : null
            }
          <Route
            exact
            path="/"
            component={() => (
              <CryptoList
                datas={this.state.datas}
                followed={this.state.followed}
                socket={socket}
              />
            )}
          />

          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/press" component={Press} />
          <Route path="/detail/:id" render={(props) => <DetailCrypto socket={socket} {...props} />}/>

          <Switch>
            <PrivateRoute exact path="/admin" component={Admin} />
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
