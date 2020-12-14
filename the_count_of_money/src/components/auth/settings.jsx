import React, { useState, useEffect } from "react";
import { Modal, Button, Card } from "react-bootstrap";
import profil from "../../utils/profil.png";
import "./settings.css";
import axios from "axios";
import Select from "react-select";


const Settings = (props) => {

  const [username, setUsername] = useState()
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [articles, setArticle] = useState([])
  const [cryptos, setCryptos] = useState([])
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
          setUsername(res.data.username)
          setEmail(res.data.email)
          setPassword(res.data.password)
          setArticle(res.data.articles)
          setCryptos(res.data.cryptos)

        })
    const fetchCryptos = async () => {
      await axios
        .get(`${process.env.REACT_APP_API_URL}/cryptos`, config)
        .then((res) => {
          let response1 = res.data.list.else
          let response2 = res.data.followed

          for (let i in response1) {
            interm.push(response1[i].id)
          }
          setCryptosElse(interm)
          interm = []
          for (let i in response2) {
            interm.push(response2[i].id)
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
    let tmp = []
    for (let i in newCrypto) {
      tmp.push(newCrypto[i].value)
      console.log('tmp', tmp)
    }
    sendCoins = cryptosFollowed.concat(tmp)
    console.log('sendCoins', sendCoins)

    const userdata = {
      username: username,
      email: email,
      password: password,
      cryptos: sendCoins,
      articles: articles
    };
    console.log('userdata', userdata)
    await axios
      .put(`${process.env.REACT_APP_API_URL}/users/profile`, {
        headers: {
          'Content-Type': 'application/json',
          "authorization": token,
        },
        username: username,
        email: email,
        password: password,
        cryptos: sendCoins,
        articles: articles
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
            <Card.Text>Surname : {username}</Card.Text>
            <Card.Text>Email : {email}</Card.Text>
            <Card.Text>Coins displayed : {cryptos.map((i) => {
              return i + ', '
            })}

            </Card.Text>
            <Card.Text>Tags : {articles.map((i) => {
              return i + ', '
            })}</Card.Text>
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
                placeholder={username}
                aria-label="Username"
                aria-describedby="addon-wrapping"
                onChange={(event) => setUsername(event.target.value)}
              ></input>
              <h5>Mail :</h5>
              <input
                type="text"
                className="form-control"
                placeholder={email}
                aria-label="Mail"
                aria-describedby="addon-wrapping"
                onChange={(event) => setEmail(event.target.value)}
              ></input>
              <h5>Change my password :</h5>
              <input
                type="password"
                className="form-control"
                aria-label="Password"
                aria-describedby="addon-wrapping"
                onChange={(event) => setPassword(event.target.value)}
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
