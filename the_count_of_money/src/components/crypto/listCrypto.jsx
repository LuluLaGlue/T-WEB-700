import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';


const LocationWeather = props => (
    <div className="col-3 p-2">
        <div className="card text-center location-card bg-light text-dark">
            <div className="card-body">
                <h5 className="card-title">
                    <Link to={ "/detail/" + props.location._id }>{ props.location.location_name }</Link>
                </h5>
                <h1 className="card-text card-degree">{ props.location.temp }°</h1>
                <h6 className="card-subtitle mb-2">{ props.location.weather }</h6>
                <h5 className="text-left">
                    { props.location.temp_min }
                    <span className="float-right">{ props.location.temp_max }</span>
                </h5>
                <p className="text-left pb-2">
                    min
                    <span className="float-right">max</span>
                </p>
                <Link to={ "/detail/" + props.location._id } className="card-link">Details</Link>
                <Link to={ "/edit/" + props.location._id } className="card-link">Edit</Link>
                <Link to={ "/delete/" + props.location._id } className="card-link">Delete</Link>
            </div>
        </div>
    </div>
)

export default class CryptoList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            locations: [],
            locations_weather: []
        };
    }

    updateCryptos(json) {
        var result = json.map(function(location, i){
            axios.get(`http://localhost:4000/location/updateweather/${location._id}`)
            .catch(function (error){console.log(error);})
        });
        return result
    }

    componentDidMount() {
        axios.get(
            'http://localhost:4000/location/'
        ).then(
            response => {
                this.setState({ locations: response.data });
                this.updateCryptos(response.data);
            }
        ).catch(function (error){console.log(error);})
        return true
    }

    locationWeatherList() {
        return this.state.locations.map(function(currentLocation, i){
            return <LocationWeather location={ currentLocation } key={i} />
        })
    }

    render() {
        return (
            <div>
                <h2 className="text-center">Today</h2>
                <div className="row pt-2">
                    { this.locationWeatherList() }
                    <div className="col-3 p-2">
                        <Link to={ "/add/" } className="card-link">
                            <div className="card text-center location-card bg-light">
                                <div className="card-body">
                                    <h1 className="card-text">
                                        Add Location
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
