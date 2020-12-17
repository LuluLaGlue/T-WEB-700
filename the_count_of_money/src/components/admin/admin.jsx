import React, { Component } from "react";
import { Card } from "react-bootstrap";
//import "./settings.css";
import axios from "axios";
import io from "socket.io-client"
import Select from "react-select";

let socket
class Admin extends Component {

    constructor(props) {
        super(props)
        this.state = {
            cryptos: [],
            tags: [],
            search: [],
            input: '',
            button: true,
            config: {
                headers: {
                    authorization: localStorage.getItem("jwtToken")
                },
            },
            interm: [],
            message: ""
        };
        socket = io(process.env.REACT_APP_ENDPOINT)
        this.handleChange = this.handleChange.bind(this);
        this.method = this.method.bind(this);
    }
    method(e) {
        e.preventDefault();
    }

    componentDidMount() {
        const fetchcrypto = async () =>
            await axios
                .get(`${process.env.REACT_APP_API_URL}/cryptos`, this.state.config
                )
                .then((res) => {

                    if (res.data.list.else) {
                        let response = res.data.list.else
                        for (let i in response) {
                            this.state.interm.push(response[i].name)
                        }
                        response = res.data.list.followed
                        for (let i in response) {
                            this.state.interm.push(response[i].name)
                        }
                    } else {
                        let response = res.data.list
                        for (let i in response) {
                            this.state.interm.push(response[i].name)
                        }
                    }
                    this.setState({ cryptos: this.state.interm })
                });
        /*         const fetchTags = async () => {
                    await axios
                        .get(`${process.env.REACT_APP_API_URL}/articles/list/categories`, config)
                        .then((result) => {
                            setAdminInfo({ tags: result });
                        });
                } */
        socket.on("get_request", this.setSearched)
        socket.on("accept_authorized", this.setMessage)
        fetchcrypto();
        //fetchTags()

    }
    setMessage = (crypto) => {
        let response = crypto.list
        let temp = []
        for (let i in response) {
            temp.push(response[i].name)
        } this.setState({
            message: crypto.message,
            cryptos: temp
        })
    }

    setSearched = (cryptos) => {
        this.setState({ search: cryptos.list })
        if (cryptos.list.length > 0 && this.state.input.length > 2) {
            for (let i = 0; i < cryptos.list.length; i++) {
                if (this.state.input === cryptos.list[i].id) {
                    this.setState({ buttonDisabled: false })
                    break;
                }
                else this.setState({ buttonDisabled: true })
            }
        }
        else this.setState({ buttonDisabled: true })
    }

    handleChange = (event) => {
        console.log('event', event.target.value)
        this.setState({ buttonDisabled: true })
        this.setState({ input: event.target.value })
        if (event.target.value.length > 2) {
            socket.emit("ask_search", event.target.value)
        }
    }

    /*     submit = async (e) => {
            e.preventDefault();
    
            const admindata = {
                config,
                cryptos: cryptos,
    
            };
            await axios
                .post(`${process.env.REACT_APP_API_URL}/validrequests`, admindata)
                .then((res) => {
                    console.log("res", res);
                });
        }; */

    addCrypto = (event) => {
        socket.emit("to_authorized", { id: this.state.input, token: localStorage.getItem("jwtToken") })
    }
    render() {
        let user = JSON.parse(localStorage.getItem("userInfo"))
        if (user.role !== "admin") {
            return <span>FORBIDDEN</span>
        } else
            return (
                <>
                    <div id="profileDiv" className="d-flex justify-content-center">
                        <Card className="p-3" border="info" style={{ width: "50rem" }}>
                            <Card.Body id="bodyCard">
                                <Card.Title id="profileTitle"><h2>Manage the website's datas</h2></Card.Title>
                                <Card.Text>
                                    Crypto currencies displayed on website:
                                    <ul>
                                        {this.state.cryptos.map((i) => {
                                            return (
                                                <li className="list-group-item">{i}</li>
                                            )
                                        })
                                        }
                                    </ul>

                                </Card.Text>

                                {/* <Card.Text>Tags : {adminInfo.article}</Card.Text> */}

                                <input list="dlist" name="cryptos" onChange={this.handleChange} />
                                <button onClick={this.addCrypto} disabled={this.state.buttonDisabled}>Add</button>
                                <span>{this.state.message}</span>
                                <datalist id="dlist">
                                    {this.state.search.map((currentCrypto) => {
                                        return (
                                            <option value={currentCrypto.id} key={currentCrypto.id}>{currentCrypto.symbol}</option>
                                        )
                                    })
                                    }
                                </datalist>

                            </Card.Body>
                        </Card>

                    </div>
                </>
            )
    }

} /* <Select
    options={
        adminInfo.search ?
            adminInfo.search.map((dataMap) => {
                return { value: dataMap, label: dataMap };
            }) : null
    }
    isMulti
    isClearable
    className="basic-multi-select"
    onChange={(e) => {
        newCrypto = e;
    }}
    onInputChange={(e) => { callSocket(e) }}
/> */

export default Admin;
