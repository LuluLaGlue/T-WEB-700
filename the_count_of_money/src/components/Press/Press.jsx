import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Container, Row, Card, Col, CardDeck } from "react-bootstrap";
import "./press.css";
import { getMoneyCurrency } from "../../actions/adminActions";

const Press = () => {
  const [data, setData] = useState([
    {
      id: 1,
      title: "yo",
      article:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsam mollitia voluptas, quo iusto similique",
    },
    {
      id: 2,
      title: "well",
      article:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsam mollitia voluptas, quo iusto similique",
    },
    {
      id: 3,
      title: "tchoupi",
      article:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsam mollitia voluptas, quo iusto similique",
    },
  ]);

  return (
    <>
      <h2 className="title">Presse</h2>

      {/* <MaterialTable /> */}
      <CardDeck className="CardDesk">
        {data.map((data) => {
          return (
            <Card className="press-card">
              <Card.Body>
                <Card.Title>{data.title}</Card.Title>
                <Card.Text>{data.article}</Card.Text>
              </Card.Body>
            </Card>
          );
        })}
      </CardDeck>
    </>
  );
};

export default Press;
