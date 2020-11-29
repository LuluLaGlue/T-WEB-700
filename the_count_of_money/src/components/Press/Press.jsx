import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import Select from "react-select";
import makeAnimated from "react-select/animated";
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

  const config = {
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYjc3NmMyMjI1MmYwNGQwMGQwMGM0ZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjA1ODU5NTY0LCJleHAiOjE2MDY0NjQzNjR9.VXAvnrf9GSQUhcZ39WARbMrj4CeBHlzp82c-x-nfBMg`,
    },
  };
  const [tag, setTag] = useState([]);

  useEffect(() => {
    const fetchdata = async () =>
      await axios
        .get("http://localhost:3100/articles?params=", config)
        .then((res) => {
          console.log("res", res.data);
          setData(res.data);
        });
    const getTag = async () =>
      await axios
        .get(`http://localhost:3100/articles/list/categories`, config)
        .then((result) => {
          console.log("result", result);
          setTag(result.data);
        });
    fetchdata();
    getTag();
  }, []);

  const getPressByTag = async () => {
    await axios
      .get(`http://localhost:3100/articles?params=${tag}`, config)
      .then((res) => {
        console.log("res", res.data);
        setTag(res.data);
      });
  };

  const animatedComponents = makeAnimated();
  console.log("tag", tag);
  return (
    <>
      <h2 className="title">What's new ?</h2>

      <div>
        Search by key word :
        <div>
          <select multiple className="custom-select" data-live-search="true">
            {tag.map((data) => {
              return <option key={data}>{data}</option>;
            })}
          </select>
          <Select
            closeMenuOnSelect={false}
            components={animatedComponents}
            isMulti
            options={tag.map((data) => {
              console.log("data", data);
              return { data };
            })}
          />
          <Button onClick={getPressByTag} variant="info">
            Valider
          </Button>
        </div>
      </div>

      <div className="d-flex justify-content-center">
        <div className="d-flex justify-content-center press-container">
          {data.map((data) => {
            return (
              <Card className="press-card" key={data.id}>
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
    </>
  );
};

export default Press;
