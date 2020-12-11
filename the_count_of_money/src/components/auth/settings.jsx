import React, { useState, useEffect } from "react";
import { Modal, Button, Card } from "react-bootstrap";
import profil from "../../utils/profil.png";
import "./settings.css";
import axios from "axios";

const Settings = (props) => {
  const [username, setUsername] = useState("Sandrine");
  const [email, setEmail] = useState("dasilva.sandrine31@gmail.com");
  const [password, setPassword] = useState("azerty");
  const [article, setArticle] = useState("");

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const token = localStorage.getItem("jwtToken");
  console.log("token profil", token);

  const config = {
    headers: {
      token,
      //Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYjc3NmMyMjI1MmYwNGQwMGQwMGM0ZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjA1ODU5NTY0LCJleHAiOjE2MDY0NjQzNjR9.VXAvnrf9GSQUhcZ39WARbMrj4CeBHlzp82c-x-nfBMg`,
    },
  };
  useEffect(() => {
    const fetchdata = async () =>
      await axios
        .get(`${process.env.REACT_APP_API_URL}/users/profile`, config)
        .then((res) => {
          console.log("res", res);
          setUsername(res.data.username);
          setEmail(res.data.email);
          //articles ??
        });
    fetchdata();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    const userdata = {
      config,
      username: username,
      email: email,
      password: password,
    };
    await axios
      .put(`${process.env.REACT_APP_API_URL}/users/profile`, userdata)
      .then((res) => {
        console.log("res", res);
        setUsername(res.data.username);
        setEmail(res.data.email);
      });

    //appel axios
  };

  return (
    <>
      <div id="profileDiv" className="d-flex justify-content-center">
        <Card className="p-3" border="info" style={{ width: "25rem" }}>
          <Card.Img id="profile" variant="top" src={profil} />

          <Card.Body>
            <Card.Title id="profileTitle">My profile</Card.Title>
            <Card.Text>Surname : {username}</Card.Text>
            <Card.Text>Email : {email}</Card.Text>
            <Card.Text>Coins displayed : </Card.Text>
            <Card.Text>Tags : {article}</Card.Text>
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
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Update my profile
            </Modal.Title>
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
            <Button onClick={submit}>Validate</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Settings;
