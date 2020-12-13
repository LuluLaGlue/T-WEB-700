import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../../actions/authActions";
import classnames from "classnames";

class Login extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      email: "",
      password: "",
      errors: {},
    };
  }

  componentDidMount() {
    // If logged in and user navigates to Login page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push("/"); // push user to dashboard when they login
    }
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors,
      });
    }
  }

  onChange(e) {
    this.setState({ [e.target.id]: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();

    const userData = {
      email: this.state.email,
      password: this.state.password,
    };

    this.props.loginUser(userData);
  }

  render() {
    const { errors } = this.state;

    return (
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col-6 p-5 mt-5 card">
            <Link to="/">Back to home</Link>
            <h4>
              <b>Login</b> below
            </h4>
            <form noValidate onSubmit={this.onSubmit}>
              <span className="red-text">
                {errors.email}
                {errors.emailnotfound}
              </span>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  onChange={this.onChange}
                  value={this.state.email}
                  error={errors.email}
                  id="email"
                  type="email"
                  className={classnames("form-control", {
                    invalid: errors.email || errors.emailnotfound,
                  })}
                />
              </div>
              <span className="red-text">
                {errors.password}
                {errors.passwordincorrect}
              </span>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  onChange={this.onChange}
                  value={this.state.password}
                  error={errors.password}
                  id="password"
                  type="password"
                  className={classnames("form-control", {
                    invalid: errors.password || errors.passwordincorrect,
                  })}
                />
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-primary">
                  Login
                </button>
              </div>
            </form>
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
});

export default connect(mapStateToProps, { loginUser })(Login);
