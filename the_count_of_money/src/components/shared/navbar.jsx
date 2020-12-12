import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import { Navbar, NavDropdown, Nav, Container } from "react-bootstrap";

class NavbarSite extends Component {
  onLogoutClick = (e) => {
    e.preventDefault();
    this.props.logoutUser();
  };

  render() {
    //const { user } = this.props.auth;
    const user = localStorage.getItem("userInfo");
    console.log("user", user);

    /* let parserr = JSON.parse(user);
    console.log("parserr", parserr);
    const id = parserr.id; */
    return (
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">The Count Of Money</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="/">Market</Nav.Link>
              <Nav.Link href="/press">News</Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown
                title={
                  this.props.auth.isAuthenticated === false ? "" : `Welcome, `
                }
                id="collasible-nav-dropdown"
              >
                <NavDropdown.Item href="/login">Login</NavDropdown.Item>
                <NavDropdown.Item href="/register">Register</NavDropdown.Item>
                <NavDropdown.Item onClick={this.onLogoutClick}>
                  Logout
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

NavbarSite.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {
  logoutUser,
})(NavbarSite);
