import React from "react";
import { Link, useHistory } from "react-router-dom";
import { useState } from "react";
import UpdateProfile from "../dashboard/UpdateProfile";
import { Button, Tab, Tabs } from "react-bootstrap";

const Navbar = () => {
  let isLogged = true;
  let name = "toto";
  const [modalShow, setModalShow] = useState(false);
  const [key, setKey] = useState("money");
  const history = useHistory();

  const handleSelect = (route) => {
    setKey(route);
    history.push(route);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link to="/" className="navbar-brand">
            The count of the Money
          </Link>

          <div className="collpase nav-collapse">
            {isLogged ? (
              <ul className="navbar-nav mr-auto">
                <h5 className="navbar-brand">Bienvenue, {name}</h5>
                <li className="navbar-item">
                  <Button variant="primary" onClick={() => setModalShow(true)}>
                    Update my profile
                  </Button>

                  <UpdateProfile
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                  />
                </li>
              </ul>
            ) : (
              <ul className="navbar-nav mr-auto">
                <li className="navbar-item">
                  <Link to="/register" className="nav-link">
                    Register
                  </Link>
                </li>
                <li className="navbar-item">
                  <Link to="/login" className="nav-link">
                    Login
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => {
          handleSelect(k);
        }}
      >
        <Tab eventKey="/" title="Course of money"></Tab>
        <Tab eventKey={"/press"} title="Press"></Tab>
      </Tabs>
    </>
  );
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps, {
        logoutUser
    }
)(Navbar);
