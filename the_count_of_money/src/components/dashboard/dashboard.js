import { useState } from "react";
import UpdateProfile from "./UpdateProfile";
import Press from "../Press/Press";

const Dashboard = () => {
  const [modalShow, setModalShow] = useState(false);

  return (
    <>
      <Press />

      <UpdateProfile show={modalShow} onHide={() => setModalShow(false)} />
    </>
  );
};

export default Dashboard;
