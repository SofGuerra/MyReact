import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.css";
import "./Header.css";
import PopUp from "./PopUp";
import DataTable from "react-data-table-component";
import Cookies from "js-cookie";

interface ManageUsersProps {
  setShown: (value: boolean) => void;
}

interface AgentDataRow {
  username: string;
  name: string;
  type: "ADMIN" | "NORMAL";
}

const ManageUsers: React.FC<ManageUsersProps> = ({ setShown }) => {
  const [agents, setAgents] = useState<AgentDataRow[]>([]);

  const token = Cookies.get("token");

  // Fetch agents
  let fetchAgents = async () => {
    if (!token) return;
    let response = await fetch("/api/agents", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });
    let json = await response.json();
    setAgents(json.agents);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <PopUp onClose={() => setShown(false)}>
      <h5>Manage Users</h5>
      <hr></hr>
      <></>
    </PopUp>
  );
};

export default ManageUsers;
