/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

const UpdateProfile = (props) => {
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const config = {
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYjc3NmMyMjI1MmYwNGQwMGQwMGM0ZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjA1ODU5MTI5LCJleHAiOjE2MDY0NjM5Mjl9.SrqKO6fxo9zIBeLm1gb8aCZsn9i9eiJzJbld6FIeMN8`,
    },
  };
  useEffect(() => {
    const userInfo = async () =>
      await axios
        .get("http://localhost:3100/users/profile", config)
        .then((res) => {
          console.log("res", res);
          setUsername(res);
          setEmail();
          setPassword();
        });
    userInfo();
  }, []);

  const updateProfile = async () => {
    let data = {
      email: email,
      password: password,
      username: username,
    };

    await axios
      .put(`http://localhost:3100/users/profile`, data, config)
      .then((response) => {
        props.onHide();
      })
      .catch((err) => {
        window.alert("Une erreur est arrivée");
      });
  };

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">My profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Username :</h5>
        <input
          type="text"
          className="form-control"
          placeholder={username}
          aria-label="Username"
          aria-describedby="addon-wrapping"
        ></input>
        <h5>Mail :</h5>
        <input
          type="text"
          className="form-control"
          placeholder={email}
          aria-label="Mail"
          aria-describedby="addon-wrapping"
        ></input>
        <h5>Change my password :</h5>
        <input
          type="password"
          className="form-control"
          placeholder={password}
          aria-label="Password"
          aria-describedby="addon-wrapping"
        ></input>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={updateProfile}>Validate</Button>
      </Modal.Footer>
    </Modal>
  );
};
export default UpdateProfile;
