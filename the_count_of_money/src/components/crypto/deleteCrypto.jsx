import React, { Component } from 'react';
import axios from 'axios';

export default class RemoveLocation extends Component {

    constructor(props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            location_name: '',
        }
    }

    componentDidMount() {
        axios.get(
            'http://localhost:4000/location/' + this.props.match.params.id
        ).then(
            response => {
                this.setState({
                    location_name: response.data.location_name,
                })
            }
        ).catch(
            function (error) {
                console.log(error);
            }
        )
    }

    onSubmit(e) {
        axios.get(
            'http://localhost:4000/location/delete/' + this.props.match.params.id
        ).then(this.props.history.push('/'));
    }

    render() {
        return (
            <div>
                <h3 align="center">Delete Location {this.state.location_name}</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <input type="submit" value="Remove Location" className="btn btn-primary" />
                    </div>
                </form>
            </div>
        )
    }
}
