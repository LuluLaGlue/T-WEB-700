import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import { GET_ERRORS, SET_CURRENT_USER, USER_LOADING } from "./types";

// Register User
export const registerUser = (userData, history) => (dispatch) => {
  axios
    .post(`${process.env.REACT_APP_API_URL}/users/register`, userData)
    .then((res) => {
      history.push("/login"); // re-direct to login on successful register
    })
    .catch((err) =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      })
    );
};

// Login - get user token
export const loginUser = (userData) => (dispatch) => {
  axios
    .post(`${process.env.REACT_APP_API_URL}/users/login`, userData)
    .then((res) => {
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));

      const final_token = token.split(" ")[1];
      const config = {
        headers: {
          authorization: final_token,
        },
      };
      axios
        .get(`${process.env.REACT_APP_API_URL}/users/profile`, config)
        .then((res) => {
          const userInfo = res.data;
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
        });
    })
    .catch((err) =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      })
    );
};

// Set logged in user
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded,
  };
};

// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING,
  };
};

// Log user out
export const logoutUser = () => (dispatch) => {
  const tokenLocal = localStorage.getItem("jwtToken");

  let token = tokenLocal.replace(/Bearer /, "");
  console.log(token);
  axios
    .post(`${process.env.REACT_APP_API_URL}/users/logout`, {
      header: { authorization: token },
    })
    .then((res) => {
      // Remove token from local storage
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userInfo");

      // Remove auth header for future requests
      setAuthToken(false);

      // Set current user to empty object {} which will set isAuthenticated to false
      dispatch(setCurrentUser({}));
    })
    .catch((err) =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      })
    );
};
