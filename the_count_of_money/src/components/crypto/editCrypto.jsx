import React, { Component } from 'react';
import axios from 'axios';

export default class EditLocation extends Component {

    constructor(props) {
        super(props);

        this.onChangeLocationName = this.onChangeLocationName.bind(this);
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

    onChangeLocationName(e) {
        this.setState({
            location_name: e.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        const obj = {
            location_name: this.state.location_name,
        };

        console.log(obj);

        axios.post(
            'http://localhost:4000/location/update/'+this.props.match.params.id, obj
        ).then(res => console.log(res.data));
        
        this.props.history.push('/');
    }

    render() {
        return (
            <div>
                <h3 align="center">Update Location</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="form-group"> 
                        <label>Name: </label>
                        <input  type="text"
                                className="form-control"
                                value={this.state.location_name}
                                onChange={this.onChangeLocationName}
                                />
                    </div>
                    <br />
                    <div className="form-group">
                        <input type="submit" value="Update Location" className="btn btn-primary" />
                    </div>
                </form>
            </div>
        )
    }
}
