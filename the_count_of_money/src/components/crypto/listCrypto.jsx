import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';


const Crypto = props => (
    <div className="col-3 p-2">
        <div className="card text-center crypto-card bg-light text-dark">
            <div className="card-body">
                <h5 className="card-title">
                    <Link to={"/detail/" + props.crypto._id}>{props.crypto.name}</Link>
                </h5>
                <h1 className="card-text">{props.crypto.actual_price}</h1>
                <h5 className="text-left">
                    {props.crypto.price_change}
                    <span className="float-right">{props.crypto.highest_price}</span>
                </h5>
                <p className="text-left pb-2">
                    price change
                    <span className="float-right">highest</span>
                </p>
                <Link to={"/detail/" + props.crypto._id} className="card-link">Details</Link>
                <Link to={"/delete/" + props.crypto._id} className="card-link">Delete</Link>
            </div>
        </div>
    </div>
)

export default class CryptoList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cryptos: []
        };
    }

    componentDidMount() {
        axios.get(
            'http://localhost:3100/cryptos'
        ).then(
            response => {
                this.setState({ cryptos: response.data });
                return true
            }
        ).catch(function (error) { console.log(error); })
    }

    cryptoList() {
        return this.state.cryptos.list.map(function (currentCrypto, i) {
            return <Crypto crypto={currentCrypto} key={i} />
        })
    }

    render() {
        if (this.state.cryptos.list === undefined) { return null }
        return (
            <div>
                <h2 className="text-center">Today</h2>
                <div className="row pt-2">
                    {this.cryptoList()}
                    <div className="col-3 p-2">
                        <Link to={"/add/"} className="card-link">
                            <div className="card text-center crypto-card bg-light">
                                <div className="card-body">
                                    <h1 className="card-text">
                                        Add Crypto
                                    </h1>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
}
