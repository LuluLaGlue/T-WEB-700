import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";



const Crypto_row = props => (
    <tr class="list-group-item-action">
        <th class="align-middle py-4" scope="row">
            <Link to={"/detail/" + props.crypto.id} className="text-body">
                <img class="mr-1" src={props.crypto.logo.thumb}></img>
                {props.crypto.name}
            </Link>
        </th>
        <td class="align-middle">{props.crypto.actual_price}</td>
        <td class={props.crypto.price_change_24h > 0 ? 'text-success align-middle' : 'text-danger align-middle'}>{props.crypto.price_change_24h}</td>
        <td class="align-middle">{props.crypto.circulating_supply}</td>
        <td class="align-middle">{props.crypto.circulating_supply}</td>
        <td class="align-middle">${props.crypto.market_cap}</td>
        <td class="align-middle">{props.crypto.lowest_price_day}</td>
        <td class="align-middle">{props.crypto.highest_price_day}</td>
    </tr>
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
            return <Crypto_row crypto={currentCrypto} key={i} />
        })
    }


    render() {
        if (this.state.cryptos.list === undefined) { return null }

        const supplyTooltip = props => (
            <Tooltip {...props}>The term circulating supply refers to the number of cryptocurrency coins or tokens that are publicly available and circulating in the market.</Tooltip>
        );

        const marketTooltip = props => (
            <Tooltip {...props}>Within the blockchain industry, the term market capitalization (or market cap) refers to a metric that measures the relative size of a cryptocurrency. It is calculated by multiplying the current market price of a particular coin or token with the total number of coins in circulation.

            Market Cap = Current Price x Circulating Supply</Tooltip>
        );

        const volumeTooltip = props => (
            <Tooltip {...props}>Volume, or trading volume, is the number of units traded in a market during a given time. It is a measurement of the number of individual units of an asset that changed hands during that period.</Tooltip>
        );

        return (
            <div>
                <h1 className="text-center">Cryptos list</h1>
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Cryptocurrency</th>
                            <th scope="col">Price</th>
                            <th scope="col">24h Change</th>
                            <OverlayTrigger placement="bottom" overlay={supplyTooltip}>
                            <th scope="col">Supply</th>
                            </OverlayTrigger>
                            <OverlayTrigger placement="bottom" overlay={volumeTooltip}>
                            <th scope="col">Volume</th>
                            </OverlayTrigger>
                            <OverlayTrigger placement="bottom" overlay={marketTooltip}>
                            <th scope="col">Market cap</th>
                            </OverlayTrigger>
                            <th scope="col">24h Lowest</th>
                            <th scope="col">24h Highest</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.cryptoList()}
                    </tbody>
                </table>
            </div>
        )
    }
}
