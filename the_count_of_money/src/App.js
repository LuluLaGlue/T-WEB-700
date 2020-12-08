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
import Dashboard from "./components/dashboard/dashboard";
import CryptoList from "./components/crypto/listCrypto";
import AddCrypto from "./components/crypto/addCrypto";
import DetailCrypto from "./components/crypto/detailCrypto";
import EditCrypto from "./components/crypto/editCrypto";
import DeleteCrypto from "./components/crypto/deleteCrypto";
import Press from "./components/Press/Press";

import NavbarSite from "./components/shared/navbar";

import './App.css';

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
    render() {
        return (
            <Provider store={store}>
              <Router>
                <NavbarSite />
                <Route path="/" exact component={CryptoList} />
                <Route exact path="/register" component={Register} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/press" component={Press} />
                <Route path="/detail/:id" exact component={DetailCrypto} />
                <Switch>
                  <PrivateRoute exact path="/dashboard" component={Dashboard} />
                  <PrivateRoute exact path="/settings" component={Settings} />
                  <PrivateRoute exact path="/add" component={AddCrypto} />
                  <PrivateRoute path="/edit/:id" component={EditCrypto} />
                  <PrivateRoute path="/delete/:id" component={DeleteCrypto} />
                </Switch>
              </Router>
            </Provider>
        );
    }
}

export default App;
