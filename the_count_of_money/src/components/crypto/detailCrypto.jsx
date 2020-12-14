import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Chart from "chart.js";


export default class DetailCrypto extends Component {
    // Page de detail des crypto

    constructor(props) {
        super(props);

        this.state = {
            crypto_name: '',
            socket: props.socket
        }
        this.method = this.method.bind(this);
    }
    method(e) {
        e.preventDefault();
    }

    setCrypto = crypto => {
        this.setState(crypto.list)
        this.createChart()
    }

    componentDidMount() {
        if (this.state.socket) {
            this.state.socket.emit('requested_crypto', { id: this.props.match.params.id })
            this.state.socket.on('send_specific', this.setCrypto)
        }
        /*  axios.get(
             `${process.env.REACT_APP_API_URL}/cryptos` + this.props.match.params.id
         ).then(
             response => { this.setState(response.data) }
         ).catch(
             function (error) {
                 console.log(error);
             }
         ) */
    }

    createChart() {
        // chart avec: closing_rates highest_prices lowest_prices opening_prices
        // recuperation des donnees pour le graph
        const data_list = this.state.periods.last_60d.opening_prices;

        // utiliser pour changer la couleur du graph selon l'evolution
        const evolution_price = data_list[data_list.length - 1] - data_list[0]

        new Chart("graph", {
            type: "line",
            data: {
                labels: Array.from(Array(data_list.length).keys()),
                datasets: [
                    {
                        data: data_list,
                        pointRadius: 0,
                        fill: false,
                        lineTension: 0.1,
                        borderColor: '#778aea',
                        borderWidth: 2,
                        label: 'opening rates',
                    },
                    {
                        data: this.state.periods.last_60d.closing_rates,
                        pointRadius: 0,
                        fill: false,
                        lineTension: 0.1,
                        borderColor: "#8552ff",
                        borderWidth: 2,
                        label: 'closing rates',
                    },
                    {
                        data: this.state.periods.last_60d.highest_prices,
                        pointRadius: 0,
                        fill: true,
                        lineTension: 0.1,
                        borderColor: "#3c7d43",
                        borderWidth: 2,
                        label: 'highest prices',
                    },
                    {
                        data: this.state.periods.last_60d.lowest_prices,
                        pointRadius: 0,
                        fill: true,
                        lineTension: 0.1,
                        borderColor: "#b12c39",
                        borderWidth: 2,
                        label: 'lowest prices',
                    }
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        ticks: {
                            callback: function (value, index, values) {
                                return (values[values.length-1] - value) + " jours" ;
                            },
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            callback: function (value, index, values) {
                                return '$' + value;
                            },
                        }
                    }]
                }
            }
        });
    }

    render() {
        if (this.state.name === undefined) {
            return null;
        }

        return (
            <div className="text-light pt-4">
                <div className="container">
                    <table className="table">
                        <thead>
                            <tr className="text-light">
                                <th scope="col">#</th>
                                <th scope="col">Cryptocurrency</th>
                                <th scope="col">
                                    <span className="d-flex justify-content-end align-items-center">
                                        Price
                                    </span>
                                </th>
                                <th scope="col">
                                    <span className="d-flex justify-content-end align-items-center">
                                        low 24h
                                    </span>
                                </th>
                                <th scope="col">
                                    <span className="d-flex justify-content-end align-items-center">
                                        high 24h
                                    </span>
                                </th>
                                <th scope="col">
                                    <span className="d-flex justify-content-end align-items-center">
                                        24h
                                    </span>
                                </th>
                                <th scope="col">
                                    <span className="d-flex justify-content-end align-items-center">
                                        <span>Market cap</span>
                                    </span>
                                </th>
                                <th scope="col">
                                    <span className="d-flex justify-content-end align-items-center">
                                        <span>Supply</span>
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-bottom text-light">
                                <td className="align-middle font-weight-bold">{this.state.rank}</td>
                                <th className="align-middle py-4 " scope="row">
                                    <Link to={"/detail/" + this.state.id} crypto={this.state} className="text-light text-decoration-none">
                                        <img className="mr-1" id="crypto-image" src={this.state.logo}></img>
                                        {this.state.name}{" "}
                                        <span className="text-muted font-weight-normal">
                                            {this.state.symbol}
                                        </span>
                                    </Link>
                                </th>
                                <td className="align-middle">
                                    <span className="d-flex justify-content-end align-items-center">
                                        <b>
                                            €{new Intl.NumberFormat().format(this.state.actual_price.toFixed(4))}
                                        </b>
                                    </span>
                                </td>
                                <td className="align-middle">
                                    <span className="d-flex justify-content-end align-items-center">
                                        €{this.state.lowest_price_day.toFixed()}
                                    </span>
                                </td>
                                <td className="align-middle">
                                    <span className="d-flex justify-content-end align-items-center">
                                        €{this.state.highest_price_day.toFixed()}
                                    </span>
                                </td>
                                <td
                                    className={this.state.price_change_24h > 0 ? "text-success align-middle" : "text-danger align-middle" }>
                                    <span className="d-flex justify-content-end align-items-center">
                                        <span id="caret">
                                            {this.state.price_change_24h > 0 ? "▲" : "▼"}
                                        </span>
                                        {this.state.price_change_24h.toFixed(2)}%
                                    </span>
                                </td>
                                <td className="align-middle">
                                    <span className="d-flex justify-content-end align-items-center">
                                        €{new Intl.NumberFormat().format(this.state.market_cap.toFixed(0))}
                                    </span>
                                </td>
                                <td className="align-middle">
                                    <span className="d-flex justify-content-end align-items-center">
                                        {new Intl.NumberFormat().format(
                                            this.state.circulating_supply.toFixed(0)
                                        )}{" "}
                                        {this.state.symbol}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <h3 className="text-center pt-3">Evolution over the last 60 days</h3>
                    <canvas id="graph" width="200" height="200"></canvas>
                </div>
            </div>
        )
    }
}
