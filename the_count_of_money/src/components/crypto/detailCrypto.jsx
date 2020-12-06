import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';


export default class DetailCrypto extends Component {

    constructor(props) {
        super(props);

        this.state = {
            crypto_name: '',
        }
    }

    componentDidMount() {
        axios.get(
            'http://localhost:3100/crypto/' + this.props.match.params.id
        ).then(
            response => { this.setState(response.data) }
        ).catch(
            function (error) {
                console.log(error);
            }
        )
    }

    render() {
        return (
            <div>
                <h3 align="center">Details for {this.state.name}</h3>
                <h5>Price: {this.state.actual_price}</h5>
                <h5>Lowest 24h: {this.state.lowest_price_day}</h5>
                <h5>Highest 24h: {this.state.highest_price_day}</h5>
                <h5>Marketcap: {this.state.market_cap}</h5>
                <Link to={"/edit/" + this.state._id}>Edit</Link> | <Link to={"/delete/" + this.state._id}>Delete</Link>
            </div>
        )
    }
}
