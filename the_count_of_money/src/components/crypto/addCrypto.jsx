import React, { Component } from 'react';
import axios from 'axios';


export default class AddLocation extends Component {

    constructor(props) {
        super(props);

        this.onChangeLocationName = this.onChangeLocationName.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            location_name: '',
        }
    }

    onChangeLocationName(e) {
        this.setState({
            location_name: e.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        const newLocation = {
            location_name: this.state.location_name,
        };

        axios.post(
            'http://localhost:4000/location/add', newLocation
        ).then(
            this.props.history.push('/')
        );
    }

    render() {
        return (
            <div style={{marginTop: 10}}>
                <h3>Add a new location</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group"> 
                        <label>Name: </label>
                        <input  
                            type="text"
                            className="form-control"
                            value={this.state.location_name}
                            onChange={this.onChangeLocationName}
                        />
                    </div>
                    <div className="form-group">
                        <input type="submit" value="Add Location" className="btn btn-primary" />
                    </div>
                </form>
            </div>
        )
    }
}
