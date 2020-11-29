import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';


const CryptoWeather = props => (
    <div className="col-3 p-2">
        <div className="card text-center crypto-card bg-light text-dark">
            <div className="card-body">
                <h5 className="card-title">
                    <Link to={"/detail/" + props.crypto._id}>{props.crypto.crypto_name}</Link>
                </h5>
                <h1 className="card-text card-degree">{props.crypto.temp}°</h1>
                <h6 className="card-subtitle mb-2">{props.crypto.weather}</h6>
                <h5 className="text-left">
                    {props.crypto.temp_min}
                    <span className="float-right">{props.crypto.temp_max}</span>
                </h5>
                <p className="text-left pb-2">
                    min
                    <span className="float-right">max</span>
                </p>
                <Link to={"/detail/" + props.crypto._id} className="card-link">Details</Link>
                <Link to={"/edit/" + props.crypto._id} className="card-link">Edit</Link>
                <Link to={"/delete/" + props.crypto._id} className="card-link">Delete</Link>
            </div>
        </div>
    </div>
)

export default class CryptoList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cryptos: [],
            cryptos_weather: []
        };
    }

    updateCryptos(json) {
        var result = json.map(function (crypto, i) {
            axios.get(`http://localhost:4000/crypto/updateweather/${crypto._id}`)
                .catch(function (error) { console.log(error); })
        });
        return result
    }

    componentDidMount() {
        axios.get(
            'http://localhost:4000/crypto/'
        ).then(
            response => {
                this.setState({ cryptos: response.data });
                this.updateCryptos(response.data);
            }
        ).catch(function (error) { console.log(error); })
        return true
    }

    cryptoWeatherList() {
        return this.state.cryptos.map(function (currentCrypto, i) {
            return <CryptoWeather crypto={currentCrypto} key={i} />
        })
    }

    render() {
        return (
            <div>
                <h2 className="text-center">Today</h2>
                <div className="row pt-2">
                    {this.cryptoWeatherList()}
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
