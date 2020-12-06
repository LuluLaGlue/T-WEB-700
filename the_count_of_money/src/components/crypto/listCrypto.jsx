import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Crypto_row = (props) => (
  <tr>
    <th scope="row">
      <Link to={"/detail/" + props.crypto.id} className="text-body">
        <img class="mr-1" src={props.crypto.logo.thumb}></img>
        {props.crypto.name}
      </Link>
    </th>
    <td>{props.crypto.actual_price}</td>
    <td>{props.crypto.price_change_24h}</td>
    <td>{props.crypto.circulating_supply}</td>
    <td>{props.crypto.circulating_supply}</td>
    <td>{props.crypto.market_cap}</td>
    <td>{props.crypto.lowest_price_day}</td>
    <td>{props.crypto.highest_price_day}</td>
  </tr>
);

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
    return (
      <div>
        <h1 className="text-center">Cryptos list</h1>
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Cryptocurrency</th>
              <th scope="col">Price</th>
              <th scope="col">24h Change</th>
              <th scope="col">Supply</th>
              <th scope="col">Volume</th>
              <th scope="col">Market cap</th>
              <th scope="col">24h Lowest</th>
              <th scope="col">24h Highest</th>
            </tr>
          </thead>
          <tbody>{this.cryptoList()}</tbody>
        </table>
      </div>
    );
  }
}
