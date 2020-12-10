import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

const Crypto_row = props => (
    <tr class="list-group-item-action">
        <td class="align-middle font-weight-bold">{props.crypto.rank}</td>
        <th class="align-middle py-4" scope="row">
            <Link to={"/detail/" + props.crypto.id} className="text-body">
                <img class="mr-1" id="crypto-image" src={props.crypto.logo}></img>
                {props.crypto.name}
            </Link>
        </th>
        <td class="align-middle">€{props.crypto.actual_price.toFixed(4)}</td>
        <td class={props.crypto.price_change_24h > 0 ? 'text-success align-middle' : 'text-danger align-middle'}>
            <span id="caret">{props.crypto.price_change_24h > 0 ? '▲' : '▼'}</span>
            {props.crypto.price_change_24h.toFixed(2)}%
        </td>
        <td class="align-middle">€{props.crypto.circulating_supply}</td>
        <td class="align-middle">{props.crypto.circulating_supply}</td>
        <td class="align-middle">€{props.crypto.market_cap.toFixed(0)}</td>
    </tr>
)


export default class CryptoList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cryptos: [],
        };
    }

    componentDidMount() {
        axios
            .get("http://localhost:3100/cryptos")
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

    render() {
        if (this.state.cryptos.list === undefined) { return null }

        const supplyTooltip = props => (
            <Tooltip {...props}>The term circulating supply refers to the number of cryptocurrency coins or tokens that are publicly available and circulating in the market.</Tooltip>
        );

        const marketTooltip = props => (
            <Tooltip {...props}>Within the blockchain industry, the term market capitalization (or market cap) refers to a metric that measures the relative size of a cryptocurrency. It is calculated by multiplying the current market price of a particular coin or token with the total number of coins in circulation.
            Market Cap = Current Price x Circulating Supply</Tooltip>
        );

    const volumeTooltip = (props) => (
      <Tooltip {...props}>
        Volume, or trading volume, is the number of units traded in a market
        during a given time. It is a measurement of the number of individual
        units of an asset that changed hands during that period.
      </Tooltip>
    );

        return (
            <div class="row justify-content-md-center">
                <div className="col-9">
                    <table class="table my-4">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Cryptocurrency</th>
                                <th scope="col">Price</th>
                                <th scope="col">24h</th>
                                <th scope="col">
                                    <OverlayTrigger placement="bottom" overlay={marketTooltip}>
                                        <span>Market cap <FontAwesomeIcon className="text-muted" icon={faInfoCircle} /></span>
                                    </OverlayTrigger>
                                </th>
                                <th scope="col">
                                    <OverlayTrigger placement="bottom" overlay={volumeTooltip}>
                                        <span>Volume <FontAwesomeIcon className="text-muted" icon={faInfoCircle} /></span>
                                    </OverlayTrigger>
                                </th>
                                <th scope="col">
                                    <OverlayTrigger placement="bottom" overlay={supplyTooltip}>
                                        <span>Supply <FontAwesomeIcon className="text-muted" icon={faInfoCircle} /></span>
                                    </OverlayTrigger>
                                </th>
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
