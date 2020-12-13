import React, { useState, useEffect } from "react";
import { Modal, Button, Card } from "react-bootstrap";
import profil from "../../utils/profil.png";
//import "./settings.css";
import axios from "axios";

const Admin = (props) => {
    const [adminInfo, setAdminInfo] = useState({
        cryptos: "",
    })

    const token = localStorage.getItem("jwtToken");

    const config = {
        headers: {
            token,
        },
    };
    useEffect(() => {
        const fetchdata = async () =>
            await axios
                .get(`${process.env.REACT_APP_API_URL}/cryptos`, config)
                .then((res) => {
                    console.log('res', res)
                    setAdminInfo({
                        cryptos: res.data.crypto,
                    })

                });
        fetchdata();
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

    return (
        <>
            <div id="profileDiv" className="d-flex justify-content-center">
                <Card className="p-3" border="info" style={{ width: "25rem" }}>


                    <Card.Body id="bodyCard">
                        <Card.Title id="profileTitle">Manage the website's datas</Card.Title>
                        <Card.Text>Coins displayed : {adminInfo.cryptos}

                        </Card.Text>
                        <Card.Text>Tags : {adminInfo.article}</Card.Text>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
};

export default Admin;
