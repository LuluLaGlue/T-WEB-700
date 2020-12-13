import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
//import "./settings.css";
import axios from "axios";
import Select from "react-select";

const Admin = (props) => {
    const [adminInfo, setAdminInfo] = useState({
        cryptos: "",
        tags: ""
    })

    const token = localStorage.getItem("jwtToken");

    const config = {
        headers: {
            token,
        },
    };
    let interm = []
    useEffect(() => {
        const fetchcrypto = async () =>
            await axios
                .get(`${process.env.REACT_APP_API_URL}/cryptos`, config)
                .then((res) => {
                    console.log('res', res)

                    let response = res.data.list.else
                    for (let i in response) {
                        interm.push(response[i].name)
                    }
                    setAdminInfo({
                        cryptos: interm,
                    })
                });
        /*         const fetchTags = async () => {
                    await axios
                        .get(`${process.env.REACT_APP_API_URL}/articles/list/categories`, config)
                        .then((result) => {
                            setAdminInfo({ tags: result });
                        });
                } */
        fetchcrypto();
        //fetchTags()
    }, []);

    const submit = async (e) => {
        e.preventDefault();

        const admindata = {
            config,
            cryptos: adminInfo.cryptos,

        };
        await axios
            .post(`${process.env.REACT_APP_API_URL}/validrequests`, admindata)
            .then((res) => {
                console.log("res", res);
            });
    };
    let newCrypto
    return (
        <>
            <div id="profileDiv" className="d-flex justify-content-center">
                <Card className="p-3" border="info" style={{ width: "50rem" }}>


                    <Card.Body id="bodyCard">
                        <Card.Title id="profileTitle">Manage the website's datas</Card.Title>
                        <Card.Text>
                            <th>Coins displayed on website:</th>
                            <tr>{adminInfo.cryptos}</tr>
                        </Card.Text>

                        {/* <Card.Text>Tags : {adminInfo.article}</Card.Text> */}
                    </Card.Body>
                    <Select
                        options={adminInfo.cryptos.map((dataMap) => {
                            return { value: dataMap, label: dataMap };
                        })}
                        isMulti
                        isClearable
                        className="basic-multi-select"
                        onChange={(e) => {
                            newCrypto = e;
                        }}
                    />
                </Card>
            </div>
        </>
    );
};

export default Admin;
