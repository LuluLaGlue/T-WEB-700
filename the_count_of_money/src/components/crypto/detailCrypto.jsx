import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Chart from "chart.js";
import { useEffect } from "react";



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
        console.log(crypto)
        this.setState(crypto.list)
        this.createChart()
    }

    componentDidMount() {
        if (this.props.socket) {

            this.props.socket.emit('specific_crypto', { id: this.props.match.params.id })
            this.props.socket.on('send_specific', this.setCrypto)

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
        // recuperation des donnees pour le graph
        const data_list = this.state.periods.last_month.opening_prices;

        // utiliser pour changer la couleur du graph selon l'evolution
        const evolution_price = data_list[data_list.length - 1] - data_list[0]
        new Chart("graph", {
            type: "line",
            data: {
                labels: Array.from(Array(data_list.length).keys()),
                datasets: [{
                    data: data_list,
                    pointRadius: 0,
                    fill: false,
                    lineTension: 0,
                    borderColor: evolution_price > 0 ? '#22922d' : '#dc3545',
                    borderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            display: false,
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
            <div className="bg-dark text-light">
                <div className="container">
                    <h3 align="center">Details for {this.state.name}</h3>
                    <h5>Price: {this.state.actual_price}</h5>
                    <h5>Lowest 24h: {this.state.lowest_price_day}</h5>
                    <h5>Highest 24h: {this.state.highest_price_day}</h5>
                    <h5>Marketcap: {this.state.market_cap}</h5>
                    <canvas id="graph" width="200" height="200"></canvas>
                    <Link to={"/edit/" + this.state.id}>Edit</Link> | <Link to={"/delete/" + this.state.id}>Delete</Link>
                </div>
            </div>
        )
    }
}
