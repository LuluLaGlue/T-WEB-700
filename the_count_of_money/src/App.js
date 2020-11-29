import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";

import { Provider } from "react-redux";

import "bootstrap/dist/css/bootstrap.min.css";

import store from "./store";

import Home from "./components/core/home";
import Register from "./components/auth/register.component";
import Login from "./components/auth/login.component";
import Settings from "./components/auth/settings.component";
import PrivateRoute from "./components/private-route/privateRoute";
import Dashboard from "./components/dashboard/dashboard";
import CryptoList from "./components/crypto/listCrypto.component";
import AddLocation from "./components/crypto/addCrypto.component";
import DetailLocation from "./components/crypto/detailCrypto.component";
import EditLocation from "./components/crypto/editCrypto.component";
import DeleteLocation from "./components/crypto/deleteCrypto.component";
import Press from "./components/Press/Press";

import NavbarSite from "./components/shared/navbar.component";

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
                <div className="Container">
                  <NavbarSite />
                  <div className="container">
                    <Route path="/" exact component={CryptoList} />
                    <Route exact path="/register" component={Register} />
                    <Route exact path="/login" component={Login} />
                    <Switch>
                      <PrivateRoute exact path="/dashboard" component={Dashboard} />
                    </Switch>
                    <Route path="/add" component={AddLocation} />
                    <Route path="/detail/:id" exact component={DetailLocation} />
                    <Route path="/edit/:id" component={EditLocation} />
                    <Route path="/delete/:id" component={DeleteLocation} />
                  </div>
                </div>
              </Router>
            </Provider>
        );
    }
}

export default App;
