import React, { Component } from 'react';
import axios from 'axios';


export default class AddCrypto extends Component {

    constructor(props) {
        super(props);

        this.onChangeCryptoName = this.onChangeCryptoName.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            crypto_name: '',
        }
    }

    onChangeCryptoName(e) {
        this.setState({
            crypto_name: e.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        const newCrypto = {
            crypto_name: this.state.crypto_name,
        };

        axios.post(
            `${process.env.REACT_APP_API_URL}/crypto/add`, newCrypto
        ).then(
            this.props.history.push('/')
        );
    }

    render() {
        return (
            <div style={{ marginTop: 10 }}>
                <h3>Add a new crypto</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Name: </label>
                        <input
                            type="text"
                            className="form-control"
                            value={this.state.crypto_name}
                            onChange={this.onChangeCryptoName}
                        />
                    </div>
                    <div className="form-group">
                        <input type="submit" value="Add Crypto" className="btn btn-primary" />
                    </div>
                </form>
            </div>
        )
    }
}
