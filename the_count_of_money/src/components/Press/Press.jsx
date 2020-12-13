import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import Select from "react-select";
import "./press.css";
import Container from "react-bootstrap/Container";

const Press = () => {
  const [data, setData] = useState([]);
  const [tag, setTag] = useState([]);

  let final_token;
  const token = localStorage.getItem("jwtToken");
  if (token === null) {
    final_token = "";
  } else {
    final_token = token;
  }
  const config = {
    headers: {
      authorization: final_token,
    },
  };
  useEffect(() => {
    const fetchdata = async () =>
      await axios
        .get(`${process.env.REACT_APP_API_URL}/articles`, config)
        .then((res) => {
          setData(res.data);
        });
    const getTag = async () =>
      await axios
        .get(
          `${process.env.REACT_APP_API_URL}/articles/list/categories`,
          config
        )
        .then((result) => {
          setTag(result.data);
        });
    fetchdata();
    getTag();
  }, []);

  const getPressByTag = async (tag) => {
    let temp = ""
    for (let i in tag) {
      if (i !== tag.length) {
        temp = temp.concat((tag[i].value) + ",");
      } else {
        temp = temp.concat((tag[i].value));

      }
    }
    await axios
      .get(
        `${process.env.REACT_APP_API_URL}/articles?params=${temp}`,
        config
      )
      .then((res) => {
        setData(res.data);

      });

  };

  let newTag = [];

  return (
    <Container>
      <h2 className="d-flex justify-content-center text-white" id="title">
        NEWS
      </h2>
      <p className="text-white">Search by key word :</p>
      <div className="search">
        <div className="select">
          <Select
            options={tag.map((dataMap) => {
              return { value: dataMap, label: dataMap };
            })}
            isMulti
            isClearable
            className="basic-multi-select"
            onChange={(e) => {
              newTag = e;
            }}
          />
        </div>
        <div className="button">
          <Button onClick={() => getPressByTag(newTag)} variant="info">
            Valider
          </Button>
        </div>
      </div>
      <div className="d-flex justify-content-center">
        <div className="d-flex justify-content-center press-container">
          {data.map((data) => {
            return (
              <Card className="press-card" id="cardNews" key={data.id}>
                <Card.Body>
                  <Card.Img variant="top" src={data.img} />
                  <Card.Title>{data.title}</Card.Title>
                  <Card.Text>
                    <a href={data.src} target="_blank" rel="noreferrer">
                      {data.src}
                    </a>
                  </Card.Text>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </div>
    </Container>
  );
};

export default Press;
