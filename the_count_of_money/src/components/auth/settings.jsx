import React, { useState, useEffect } from "react";
import { Modal, Button, Card } from "react-bootstrap";
import profil from "../../utils/profil.png";
import "./settings.css";
import axios from "axios";

const Settings = (props) => {
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    password: "",
    article: "",
    cryptos: "",
  })
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const token = localStorage.getItem("jwtToken");

  const config = {
    headers: {
      token,
    },
  };
  useEffect(() => {
    const fetchdata = async () =>
      await axios
        .get(`${process.env.REACT_APP_API_URL}/users/profile`, config)
        .then((res) => {
          setUserInfo({
            username: res.data.username,
            email: res.data.email,
            password: res.data.password,
            article: res.data.article,
            cryptos: res.data.crypto,
          })
          /*           setUsername(res.data.username);
                    setEmail(res.data.email); */
          //articles ??
        });
    fetchdata();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    const userdata = {
      config,
      username: userInfo.username,
      email: userInfo.email,
      password: userInfo.password,
      cryptos: userInfo.cryptos,
      article: userInfo.article
    };
    console.log('userdata', userdata)
    await axios
      .put(`${process.env.REACT_APP_API_URL}/users/profile`, userdata)
      .then((res) => {
        console.log("res", res);

        /* setUsername(res.data.username);
        setEmail(res.data.email); */
      });
  };

  return (
    <>
      <div id="profileDiv" className="d-flex justify-content-center">
        <Card className="p-3" border="info" style={{ width: "25rem" }}>
          <Card.Img id="profile" variant="top" src={profil} />

          <Card.Body id="bodyCard">
            <Card.Title id="profileTitle">My profile</Card.Title>
            <Card.Text>Surname : {userInfo.username}</Card.Text>
            <Card.Text>Email : {userInfo.email}</Card.Text>
            <Card.Text>Coins displayed : {userInfo.cryptos}</Card.Text>
            <Card.Text>Tags : {userInfo.article}</Card.Text>
          </Card.Body>
          <Button variant="primary" onClick={handleShow}>
            Update my profile
          </Button>
        </Card>
      </div>

      <div>
        <Modal
          {...props}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          onHide={handleClose}
          show={show}
        >
          <Modal.Header id="modalHeaderFooter" closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Update my profile
            </Modal.Title>
          </Modal.Header>
          <form>
            <Modal.Body>
              <h5>Username :</h5>
              <input
                type="text"
                className="form-control"
                placeholder={userInfo.username}
                aria-label="Username"
                aria-describedby="addon-wrapping"
                onChange={(event) => setUserInfo({ username: event.target.value })}
              ></input>
              <h5>Mail :</h5>
              <input
                type="text"
                className="form-control"
                placeholder={userInfo.email}
                aria-label="Mail"
                aria-describedby="addon-wrapping"
                onChange={(event) => setUserInfo({ email: event.target.value })}
              ></input>
              <h5>Change my password :</h5>
              <input
                type="password"
                className="form-control"
                aria-label="Password"
                aria-describedby="addon-wrapping"
                onChange={(event) => setUserInfo({ password: event.target.value })}
              ></input>
              <h5>Coins displayed :</h5>
              <input
                type="text"
                className="form-control"
                placeholder={userInfo.cryptos}
                aria-label="Cryptos"
                aria-describedby="addon-wrapping"
                onChange={(event) => setUserInfo({ cryptos: event.target.value })}
              ></input>
              <h5>News displayed :</h5>
              <input
                type="text"
                className="form-control"
                placeholder={userInfo.article}
                aria-label="Article"
                aria-describedby="addon-wrapping"
                onChange={(event) => setUserInfo({ article: event.target.value })}
              ></input>
            </Modal.Body>
            <Modal.Footer id="modalHeaderFooter">
              <Button onClick={submit}>Validate</Button>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Settings;
