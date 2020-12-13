import React, { useState, useEffect } from "react";
import { Modal, Button, Card } from "react-bootstrap";
import profil from "../../utils/profil.png";
import "./settings.css";
import axios from "axios";
import Select from "react-select";


const Settings = (props) => {
  const [userInfo, setUserInfo] = useState(
    {
      username: "",
      email: "",
      password: "",
      article: "",
      cryptos: [],
    })

  const [tag, setTag] = useState([])
  const [show, setShow] = useState(false);
  const [cryptosFollowed, setCryptosFollowed] = useState([])
  const [cryptosElse, setCryptosElse] = useState([])

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const token = localStorage.getItem("jwtToken");

  const config = {
    headers: {
      authorization: token,
    },
  };
  let interm = [];
  useEffect(() => {
    const fetchdata = async () =>
      await axios
        .get(`${process.env.REACT_APP_API_URL}/users/profile`, config)
        .then((res) => {
          console.log('res', res)

          setUserInfo({
            username: res.data.username,
            email: res.data.email,
            password: res.data.password,
            article: res.data.article,
            cryptos: res.data.crypto,
          })
        })
    const fetchCryptos = async () => {
      await axios
        .get(`${process.env.REACT_APP_API_URL}/cryptos`, config)
        .then((res) => {
          let response1 = res.data.list.else
          let response2 = res.data.list.followed

          for (let i in response1) {
            interm.push(response1[i].name)
          }
          setCryptosElse(interm)
          interm = []
          for (let i in response2) {
            interm.push(response2[i].name)
          }
          setCryptosFollowed(interm)
        })
    }
    const fetchTags = async () => {
      await axios
        .get(`${process.env.REACT_APP_API_URL}/articles/list/categories`, config)
        .then((result) => {
          setTag(result.data);
        });
    }
    fetchdata();
    fetchCryptos()
    fetchTags()
  }, []);

  const submit = async () => {
    let sendCoins
    let tmp
    for (let i in newCrypto) {
      newCrypto = newCrypto[i].value
    }
    sendCoins = cryptosFollowed.concat(newCrypto)
    const userdata = {
      username: userInfo.username,
      email: userInfo.email,
      password: userInfo.password,
      cryptos: sendCoins,
      article: userInfo.article
    };
    console.log('userdata', userdata)
    await axios
      .put(`${process.env.REACT_APP_API_URL}/users/profile`, {
        headers: {
          'Content-Type': 'application/json',
          "authorization": token,
        },
        body: JSON.stringify(userdata)
      })
      .then((res) => {
        console.log("res put", res);
      });
  };
  let newCrypto = []
  let newTag = []

  return (
    <>
      <div id="profileDiv" className="d-flex justify-content-center">
        <Card className="p-3" border="info" style={{ width: "25rem" }}>
          <Card.Img id="profile" variant="top" src={profil} />

          <Card.Body id="bodyCard">
            <Card.Title id="profileTitle">My profile</Card.Title>
            <Card.Text>Surname : {userInfo.username}</Card.Text>
            <Card.Text>Email : {userInfo.email}</Card.Text>
            <Card.Text>Coins displayed : {cryptosFollowed}

            </Card.Text>
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
              <div className="select">
                <Select
                  options={cryptosElse.map((dataMap) => {
                    return { value: dataMap, label: dataMap };
                  })}
                  isMulti
                  isClearable
                  className="basic-multi-select"
                  onChange={(e) => {
                    newCrypto = e;
                  }}
                />
              </div>
              <h5>News displayed :</h5>
              <Select
                options={tag.map((dataMap) => {
                  return { value: dataMap, label: dataMap };
                })}
                isMulti
                isClearable
                className="basic-multi-select"
                onChange={(e) => {
                  newTag = e;
                }}
              />
            </Modal.Body>
            <Modal.Footer id="modalHeaderFooter">
              <Button onClick={() => submit(newTag, newCrypto)}>Validate</Button>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Settings;
