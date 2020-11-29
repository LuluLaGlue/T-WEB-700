import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';


export default class DetailLocation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            location_name: '',
        }
    }

    componentDidMount() {
        axios.get(
            'http://localhost:4000/location/' + this.props.match.params.id
        ).then(
            response => {this.setState(response.data)}
        ).catch(
            function (error) {
                console.log(error);
            }
        )
    }

    render() {
        return (
            <div>
                <h3 align="center">Details for {this.state.location_wname}</h3>
                <h5>Weather: { this.state.weather }</h5>
                <h5>Temp: { this.state.temp }</h5>
                <h5>Temp max: { this.state.temp_max }</h5>
                <h5>Temp min: { this.state.temp_min }</h5>
                <Link to={ "/edit/" + this.state._id }>Edit</Link> | <Link to={ "/delete/" + this.state._id }>Delete</Link>
            </div>
        )
    }
}
