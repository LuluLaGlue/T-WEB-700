import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import { Navbar, NavDropdown, Nav, Container } from "react-bootstrap";

class NavbarSite extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      isAdmin: ""
    };
    this.onLogoutClick = this.onLogoutClick.bind(this);
  }
  onLogoutClick = (e) => {
    e.preventDefault();
    this.props.logoutUser();
    this.props.socket.emit("connection", { token: 'undefined' })
  };
  componentDidMount() {
    const user = localStorage.getItem("userInfo");
    if (user) {
      let userParser = JSON.parse(user);
      this.setState({
        isAdmin: userParser.role,
        username: userParser.username
      })
    } else {
      this.setState({
        isAdmin: false,
        username: ""
      })

    }
  }

  render() {

    console.log('this.state.isAdmin', this.state.isAdmin)
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
                  this.props.auth.isAuthenticated === false ? "Login / Signup" : `Welcome ${this.state.username}`
                }
                id="collasible-nav-dropdown"
              >{
                  this.state.isAdmin === "admin" ?
                    <NavDropdown.Item href="/admin">Admin</NavDropdown.Item>
                    : null
                }
                {
                  this.state.username === "" ?
                    <>
                      <NavDropdown.Item href="/login">Login</NavDropdown.Item>
                      <NavDropdown.Item href="/register">Register</NavDropdown.Item>
                    </>
                    :
                    <>
                      <NavDropdown.Item onClick={this.onLogoutClick}>Logout</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
                    </>
                }
                {this.state.isAdmin === true ?
                  <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
                  : null
                }
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
