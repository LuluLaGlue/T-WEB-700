import { useState } from "react";
import UpdateProfile from "./UpdateProfile";
import { Button } from "react-bootstrap";

const Dashboard = () => {
  const [modalShow, setModalShow] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setModalShow(true)}>
        Update my profile
      </Button>

      <UpdateProfile show={modalShow} onHide={() => setModalShow(false)} />
    </>
  );
};

export default Dashboard;
