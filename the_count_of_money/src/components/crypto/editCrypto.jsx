import React, { Component } from 'react';
import axios from 'axios';

export default class EditCrypto extends Component {

    constructor(props) {
        super(props);

        this.onChangeCryptoName = this.onChangeCryptoName.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            crypto_name: '',
        }
    }

    componentDidMount() {
        axios.get(
            'http://localhost:4000/crypto/' + this.props.match.params.id
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

    onChangeCryptoName(e) {
        this.setState({
            crypto_name: e.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        const obj = {
            crypto_name: this.state.crypto_name,
        };

        console.log(obj);

        axios.post(
            'http://localhost:4000/crypto/update/' + this.props.match.params.id, obj
        ).then(res => console.log(res.data));

        this.props.history.push('/');
    }

    render() {
        return (
            <div>
                <h3 align="center">Update Crypto</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label>Name: </label>
                        <input type="text"
                            className="form-control"
                            value={this.state.crypto_name}
                            onChange={this.onChangeCryptoName}
                        />
                    </div>
                    <br />
                    <div className="form-group">
                        <input type="submit" value="Update Crypto" className="btn btn-primary" />
                    </div>
                </form>
            </div>
        )
    }
}
