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
  useEffect(() => {
    const ctx = document.getElementById(props.crypto.rank);
    const data_list = props.crypto.periods.last_month.opening_prices;
    new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from(Array(data_list.length).keys()),
        datasets: [
          {
            data: data_list,
            pointRadius: 0,
            fill: false,
            lineTension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        tooltips: {
          enabled: false,
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                drawBorder: false,
                drawOnChartArea: false,
                drawTicks: false,
                color: "#dc3545",
              },
              ticks: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                drawBorder: false,
                drawOnChartArea: false,
                drawTicks: false,
              },
              ticks: {
                callback: function (value, index, values) {
                  return "$" + value;
                },
                display: false,
              },
            },
          ],
        },
      },
    });
  });

  return (
    <tr class="list-group-item-action">
      <td class="align-middle font-weight-bold">{props.crypto.rank}</td>
      <th class="align-middle py-4" scope="row">
        <Link
          to={"/detail/" + props.crypto.id}
          className="text-body text-decoration-none"
        >
          <img class="mr-1" id="crypto-image" src={props.crypto.logo}></img>
          {props.crypto.name}{" "}
          <span class="text-muted font-weight-normal">
            {props.crypto.symbol}
          </span>
        </Link>
      </th>
      <td class="align-middle">
        €{new Intl.NumberFormat().format(props.crypto.actual_price.toFixed(4))}
      </td>
      <td
        class={
          props.crypto.price_change_24h > 0
            ? "text-success align-middle"
            : "text-danger align-middle"
        }
      >
        <span id="caret">{props.crypto.price_change_24h > 0 ? "▲" : "▼"}</span>
        {props.crypto.price_change_24h.toFixed(2)}%
      </td>
      <td class="align-middle">
        €{new Intl.NumberFormat().format(props.crypto.market_cap.toFixed(0))}
      </td>
      <td class="align-middle">
        {new Intl.NumberFormat().format(
          props.crypto.circulating_supply.toFixed(0)
        )}{" "}
        {props.crypto.symbol}
      </td>
      <td class="chart-container">
        <canvas id={props.crypto.rank} width="200" height="60"></canvas>
      </td>
    </tr>
  );
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

    const supplyTooltip = (props) => (
      <Tooltip {...props}>
        The term circulating supply refers to the number of cryptocurrency coins
        or tokens that are publicly available and circulating in the market.
      </Tooltip>
    );

    const marketTooltip = (props) => (
      <Tooltip {...props}>
        Within the blockchain industry, the term market capitalization (or
        market cap) refers to a metric that measures the relative size of a
        cryptocurrency. It is calculated by multiplying the current market price
        of a particular coin or token with the total number of coins in
        circulation. Market Cap = Current Price x Circulating Supply
      </Tooltip>
    );

    return (
      <div class="row justify-content-md-center">
        <div className="col-8">
          <table class="table my-4">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Cryptocurrency</th>
                <th scope="col">Price</th>
                <th scope="col">24h</th>
                <th scope="col">
                  <OverlayTrigger placement="bottom" overlay={marketTooltip}>
                    <span>
                      Market cap{" "}
                      <FontAwesomeIcon
                        className="text-muted"
                        icon={faInfoCircle}
                      />
                    </span>
                  </OverlayTrigger>
                </th>
                <th scope="col">
                  <OverlayTrigger placement="bottom" overlay={supplyTooltip}>
                    <span>
                      Supply{" "}
                      <FontAwesomeIcon
                        className="text-muted"
                        icon={faInfoCircle}
                      />
                    </span>
                  </OverlayTrigger>
                </th>
                <th scope="col">Last month</th>
              </tr>
            </thead>
            <tbody>{this.cryptoList()}</tbody>
          </table>
        </div>
      </div>
    );
  }
}
