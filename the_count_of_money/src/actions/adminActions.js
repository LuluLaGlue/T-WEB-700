import axios from "axios";

// Register User
export const getMoneyCurrency = () => {
  axios.get(`http://localhost:4000/??`).then((result) => {
    for (let i in result.data) {
      return result.data;
    }
  });
};
