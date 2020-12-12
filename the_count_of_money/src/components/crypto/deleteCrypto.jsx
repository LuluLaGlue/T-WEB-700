import React, { Component } from 'react';
import axios from 'axios';


export default class RemoveCrypto extends Component {

    constructor(props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            crypto_name: '',
        }
    }

    componentDidMount() {
        axios.get(
            `${process.env.REACT_APP_API_URL}/crypto/` + this.props.match.params.id
        ).then(
            response => {
                this.setState({
                    crypto_name: response.data.crypto_name,
                })
            }
        ).catch(
            function (error) {
                console.log(error);
            }
        )
    }

    onSubmit(e) {
        axios.get(
            `${process.env.REACT_APP_API_URL}/crypto/delete` + this.props.match.params.id
        ).then(this.props.history.push('/'));
    }

    render() {
        return (
            <div>
                <h3 align="center">Delete Crypto {this.state.crypto_name}</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <input type="submit" value="Remove Crypto" className="btn btn-primary" />
                    </div>
                </form>
            </div>
        )
    }
}
