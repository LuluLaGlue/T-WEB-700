import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import Select from "react-select";
import "./press.css";
import Container from "react-bootstrap/Container";

const Press = () => {
  const [data, setData] = useState([
    {
      id: 1,
      title: "title1",
      article: "Lorem ipsum",
    },
    {
      id: 2,
      title: "title2",
      article: "Lorem ipsum",
    },
    {
      id: 3,
      title: "title3",
      article: "Lorem ipsum",
    },
  ]);
  const token = localStorage.getItem("jwtToken");
  console.log("token profil", token);

  const config = {
    headers: {
      token,
      //Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYjc3NmMyMjI1MmYwNGQwMGQwMGM0ZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjA1ODU5NTY0LCJleHAiOjE2MDY0NjQzNjR9.VXAvnrf9GSQUhcZ39WARbMrj4CeBHlzp82c-x-nfBMg`,
    },
  };
  const [tag, setTag] = useState([]);

  useEffect(() => {
    const fetchdata = async () =>
      await axios
        .get(`${process.env.REACT_APP_API_URL}/articles?params=`, config)
        .then((res) => {
          console.log("res", res);
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

  const getPressByTag = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/articles?params=${newTag}`, config)
      .then((res) => {
        console.log("res", res.data);
        /* res.data.map((i) => {
          return setData(i);
        }); */
      });
  };

  let newTag = [];

  console.log("newTag", newTag);
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
              //newTag.push(e.value);
              newTag = e;
              console.log("test", newTag);
              console.log("e", e);
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
