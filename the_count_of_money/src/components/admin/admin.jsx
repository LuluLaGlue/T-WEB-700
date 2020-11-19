import { Grid } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./admin.css";
//import MaterialTable from "./table/MaterialTable";
//import {Grid} from "material-ui"
import DeleteIcon from "@material-ui/icons/Delete";
import { Paper, Table } from "@material-ui/core";
import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { getMoneyCurrency } from "../../actions/adminActions";

const Admin = () => {
  const [data, setData] = useState([
    {
      id: 1,
      name: "bitcoin",
    },
    {
      id: 2,
      name: "ethereum",
    },
    {
      id: 3,
      name: "litecoin",
    },
    {
      id: 4,
      name: "XRP",
    },
    {
      id: 5,
      name: "chainlink",
    },
    {
      id: 6,
      name: "tron",
    },
    {
      id: 7,
      name: "EOS",
    },
    {
      id: 8,
      name: "bitcoin cash",
    },
  ]);
  const history = useHistory();

  useEffect(() => {
    getMoneyCurrency();
  }, []);

  const removeMoney = (idMoney) => {
    //history.push(`/apisuppr/${idMoney}`);
    //setData(data.splice(idMoney));
    //setData(`appel à l'api pour supprimer l'id ${idMoney}`);
    setData(idMoney);
    //alert("appel à l'api pour supprimer l'id " + idMoney);
  };

  const columns = [{ id: "money", label: "Money Currency", minWidth: 170 }];
  return (
    <>
      <Grid container justify="center">
        <Grid item className="dashboard-container" lg={12}>
          <Grid container direction="column">
            <Grid item className="title" lg={10} md={10} sm={10} xs={10}>
              <h2>Liste des monnaies à afficher</h2>
              {/* <MaterialTable /> */}

              <Paper>
                <TableContainer>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{ minWidth: column.minWidth }}
                          >
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((data) => (
                        <TableRow hover tabIndex={-1} key={columns.id}>
                          <TableCell>{data.name}</TableCell>
                          <TableCell>
                            <DeleteIcon
                              onClick={() => removeMoney(data.id)}
                              color="error"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item className="title">
              <h2>Liste des articles à afficher</h2>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Admin;
