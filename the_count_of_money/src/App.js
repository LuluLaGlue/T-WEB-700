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
          <Navbar />
          <Route exact path="/" component={Home} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/press" component={Press} />
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
