import React, { Component } from "react";
import Chart from "chart.js";
import { Link } from "react-router-dom";
import axios from "axios";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";


function Crypto_row(props) {
    // Props representant une ligne de la liste des cryptos

    const last_7d = props.crypto.periods.last_week.opening_prices
    const last_7d_purcent = (
        (last_7d[last_7d.length - 1] - last_7d[0]) / last_7d[last_7d.length - 1]
    ) * 100

    useEffect(() => {
        const ctx = document.getElementById(props.crypto.rank);

        // recuperation des donnees pour le graph
        const data_list = props.crypto.periods.last_month.opening_prices;

        // utiliser pour changer la couleur du graph selon l'evolution
        const evolution_price = data_list[data_list.length - 1] - data_list[0]
        new Chart(ctx, {
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
                tooltips: {
                    enabled: false
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            drawBorder: false,
                            drawOnChartArea: false,
                            drawTicks: false,
                            color: '#dc3545',
                        },
                        ticks: {
                            display: false,
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            drawBorder: false,
                            drawOnChartArea: false,
                            drawTicks: false,
                        },
                        ticks: {
                            callback: function (value, index, values) {
                                return '$' + value;
                            },
                            display: false,
                        }
                    }]
                }
            }
        });
    });

    return (
        <tr className="border-bottom text-light">
            <td className="align-middle font-weight-bold">{props.crypto.rank}</td>
            <th className="align-middle py-4 " scope="row">
                <Link to={"/detail/" + props.crypto.id} className="text-light text-decoration-none">
                    <img className="mr-1" id="crypto-image" src={props.crypto.logo}></img>
                    {props.crypto.name} <span className="text-muted font-weight-normal">{props.crypto.symbol}</span>
                </Link>
            </th>
            <td className="align-middle">
                <span className="d-flex justify-content-end align-items-center">
                    <b>€{new Intl.NumberFormat().format(props.crypto.actual_price.toFixed(4))}</b>
                </span>
            </td>
            <td className="align-middle">
                <span className="d-flex justify-content-end align-items-center">
                    €{props.crypto.lowest_price_day.toFixed()}
                </span>
            </td>
            <td className="align-middle">
                <span className="d-flex justify-content-end align-items-center">
                    €{props.crypto.highest_price_day.toFixed()}
                </span>
            </td>
            <td className={props.crypto.price_change_24h > 0 ? 'text-success align-middle' : 'text-danger align-middle'}>
                <span className="d-flex justify-content-end align-items-center">
                    <span id="caret">{props.crypto.price_change_24h > 0 ? '▲' : '▼'}</span>
                    {props.crypto.price_change_24h.toFixed(2)}%
                </span>
            </td>
            <td className={last_7d_purcent > 0 ? 'text-success align-middle' : 'text-danger align-middle'}>
                <span className="d-flex justify-content-end align-items-center">
                    <span id="caret">{last_7d_purcent > 0 ? '▲' : '▼'}</span>
                    {last_7d_purcent.toFixed(2)}%
                </span>
            </td>
            <td className="align-middle">
                <span className="d-flex justify-content-end align-items-center">
                    €{new Intl.NumberFormat().format(props.crypto.market_cap.toFixed(0))}
                </span>
            </td>
            <td className="align-middle">
                <span className="d-flex justify-content-end align-items-center">
                    {new Intl.NumberFormat().format(props.crypto.circulating_supply.toFixed(0))} {props.crypto.symbol}
                </span>
            </td>
            <td className="chart-container py-1">
                <canvas id={props.crypto.rank} width="200" height="60"></canvas>
            </td>
        </tr>
    )
}


export default class CryptoList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cryptos: [],
        };
    }

    componentDidMount() {
        axios
            .get(`${process.env.REACT_APP_API_URL}/cryptos`)
            .then((response) => {
                this.setState({ cryptos: response.data });
                return true;
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    cryptoList() {
        return this.state.cryptos.list.map(function (currentCrypto, i) {
            return <Crypto_row crypto={currentCrypto} key={i} />;
        });
    }

    render() {
        if (this.state.cryptos.list === undefined) {
            return null;
        }

        const supplyTooltip = (props) => (
            <Tooltip {...props}>
                Number of cryptocurrency coins tokens that are publicly available and circulating in the market.
            </Tooltip>
        );

        const marketTooltip = (props) => (
            <Tooltip {...props}>
                Market Cap = Current Price x Circulating Supply
            </Tooltip>
        );

        return (
            <div className="justify-content-md-center border-top">
                <div className="px-5 pb-5 pt-4 bg-dark text-light">
                    <table className="table">
                        <thead>
                            <tr className="text-light">
                                <th scope="col">#</th>
                                <th scope="col">Cryptocurrency</th>
                                <th scope="col"><span className="d-flex justify-content-end align-items-center">Price</span></th>
                                <th scope="col"><span className="d-flex justify-content-end align-items-center">low 24h</span></th>
                                <th scope="col"><span className="d-flex justify-content-end align-items-center">high 24h</span></th>
                                <th scope="col"><span className="d-flex justify-content-end align-items-center">24h</span></th>
                                <th scope="col"><span className="d-flex justify-content-end align-items-center">7d</span></th>
                                <th scope="col">
                                    <span className="d-flex justify-content-end align-items-center">
                                        <OverlayTrigger placement="bottom" overlay={marketTooltip}>
                                            <span>Market cap <FontAwesomeIcon className="text-muted pl-1" icon={faInfoCircle} /></span>
                                        </OverlayTrigger>
                                    </span>
                                </th>
                                <th scope="col">
                                    <span className="d-flex justify-content-end align-items-center">
                                        <OverlayTrigger placement="bottom" overlay={supplyTooltip}>
                                            <span>Supply <FontAwesomeIcon className="text-muted pl-1" icon={faInfoCircle} /></span>
                                        </OverlayTrigger>
                                    </span>
                                </th>
                                <th scope="col"><span className="d-flex justify-content-end align-items-center">Last month</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.cryptoList()}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
