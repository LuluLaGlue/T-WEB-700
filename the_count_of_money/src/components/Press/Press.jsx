import React, { useEffect, useState } from "react";
import axios from "axios";
//import { useHistory } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import "./press.css";

const Press = () => {
  const [data, setData] = useState([
    {
      id: 1,
      title: "title1",
      article:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsam mollitia voluptas, quo iusto similique",
    },
    {
      id: 2,
      title: "title2",
      article:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsam mollitia voluptas, quo iusto similique",
    },
    {
      id: 3,
      title: "title3",
      article:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsam mollitia voluptas, quo iusto similique",
    },
  ]);
  const [tag, setTag] = useState();
  const config = {
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYjc3NmMyMjI1MmYwNGQwMGQwMGM0ZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjA1ODU5NTY0LCJleHAiOjE2MDY0NjQzNjR9.VXAvnrf9GSQUhcZ39WARbMrj4CeBHlzp82c-x-nfBMg`,
    },
  };

  useEffect(() => {
    const fetchdata = async () =>
      await axios
        .get("http://localhost:3000/articles?params=bitcoin", config)
        .then((res) => {
          console.log("res", res.data);
          setData(res.data);
          console.log("data", data);
        });
    const getKeyWord = async () =>
      await axios.get(`http://localhost:3000/articles/list/categories`, config)
        .then;
    fetchdata();
    getKeyWord();
  }, []);

  return (
    <>
      <h2 className="title">What's new ?</h2>

      <div>
        Search with key word :<input>{tag}</input>
        <Button onClick={setTag} variant="info">
          Valider
        </Button>
      </div>

      <div className="d-flex justify-content-center">
        <div className="d-flex justify-content-center press-container">
          {data.map((data) => {
            return (
              <Card className="press-card" key={data.id}>
                <Card.Body>
                  <Card.Img variant="top" src={data.img} />
                  <Card.Title>{data.title}</Card.Title>
                  <Card.Text>{data.src}</Card.Text>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Press;
