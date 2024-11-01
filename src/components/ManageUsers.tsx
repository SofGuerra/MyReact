import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.css";
import Validations from "../validations";
import "./ManageUsers.css";
import PopUp from "./PopUp";
import Cookies from "js-cookie";
import DataTable from "react-data-table-component";
import { color } from "chart.js/helpers";

interface ManageUsersProps {
  setShown: (value: boolean) => void;
}

interface AgentDataRow {
  username: string;
  name: string;
  type: "ADMIN" | "NORMAL";
}

interface EditRow {
  username: string;
  newName: string;
  newUsername: string;
  newType: string;
}

function intersectSets<T>(set1: Set<T>, set2: Set<T>): Set<T> {
  const intersection = new Set<T>();
  set1.forEach(value => {
      if (set2.has(value)) {
          intersection.add(value);
      }
  });
  return intersection;
}

const ManageUsers: React.FC<ManageUsersProps> = ({ setShown }) => {
  const [agents, setAgents] = useState<AgentDataRow[]>([]);
  const [columns, setColumns] = useState<any>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<string>("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [addFormEnabled, setAddFormEnabled] = useState(false);
  const [serverResponseMessage, setServerResponseMessage] = useState("");
  const [serverResponseMessageColor, setServerResponseMessageColor] = useState("green");
  const [selectedRows, setSelectedRows] = useState<AgentDataRow[]>([]);
  const [removeUsersButtonText, setRemoveUsersButtonText] = useState("Remove users");
  const [removeButtonEnabled, setRemoveButtonEnabled] = useState(false);
  const [clearSelectedRows, setClearSelectedRows] = useState(false);
  const [editing, setEditing] = useState(false);


  const token = Cookies.get("token");

  let setNewUserValidationError = () => {
    if (!addFormEnabled) {
      setErrorMessage("");
      return "";
    }

    const strings = [username, password, name, userType];
    const validators = [
      Validations.validateUsername, 
      Validations.validatePassword,  
      Validations.validateName, 
      Validations.validateUserType]

    for (let i = 0; i < strings.length; i++) {
      let errorMessage = validators[i](strings[i]);
      if (errorMessage != "") {
        setErrorMessage(errorMessage);
        return errorMessage;
      }
    }
    setErrorMessage("");
    return "";
  }

  let addUserSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let validationError = setNewUserValidationError();
    if (validationError != "") {
      return;
    }
    if (!token) return;
    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({
        username: username,
        password: password,
        name: name,
        type: userType.toUpperCase(),
      }),
  }).then((res) =>
    {
    if (res.status == 200)
    {
      fetchAgents();
      setServerResponseMessage("User created");
      setServerResponseMessageColor("green");
      setAddFormEnabled(false);
      setUsername("");
      setPassword("");
      setUserType("");
      setName("");
      setNewUserValidationError();
    } else
    {
      setServerResponseMessageColor("red");
      if (res.status == 409)
        {
          setServerResponseMessage("Name or username already exists");
        }
        else if (res.status == 403) 
        {
          // Not supposed to ever be seen since the form is hidden without admin permission
          setServerResponseMessage("No admin permission");
        }
        else 
        {
          setServerResponseMessage("Error creating user");
        }
      }
  });
}



  useEffect(() => {
    setNewUserValidationError();
  }, [username, name, userType, password]);

  // Get agends data and put it to rows
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

  // Triggered when add user button is clicked
  let triggerAddUser = () => {
    setServerResponseMessage("");
    if (addFormEnabled) {
      setAddFormEnabled(false);
      setUsername("");
      setPassword("");
      setUserType("");
      setName("");
      setErrorMessage("");
    } else {
      setAddFormEnabled(true);
    }
  }

  // Remove selected users
  let removeSelectedUsers = async () => {
    if (!token) return;
    let response = await fetch("/api/removeAgents", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agents: selectedRows.map((user) => user.username),
      })
    });
    if (response.status == 200) {
      setSelectedRows([]);
      setClearSelectedRows(true);
      fetchAgents();
    }
  }

  useEffect(() => {
    if (selectedRows.length == 0) {
      setRemoveUsersButtonText("Remove users");
      setRemoveButtonEnabled(false);
    } else if (selectedRows.length == 1) {
      setRemoveUsersButtonText("Remove user");
      setRemoveButtonEnabled(true);
    } else {
      setRemoveUsersButtonText(`Remove users (${selectedRows.length})`);
      setRemoveButtonEnabled(true);
    }
  }, [selectedRows]);

  // initalize columns
  let setColumns_ = () => {

    setColumns([
      {
        name: "Username",
        selector: "username",
        sortable: true,
        cell: (row: any) => (<div id={"username_" + row.username}>{row.username}</div>)
      },
      {
        name: "Name",
        selector: "name",
        sortable: true,
        cell: (row: any) => <div id={"name_" + row.username}>{row.name}</div>,
      },
      {
        name: "Type",
        selector: "type",
        sortable: true,
        cell: (row: any) => <div id={"type_" + row.username}>{row.type}</div>,
      },
    ]);
  };



  // Primary use effect to set columns and rows
  useEffect(() => {
    setColumns_();
    fetchAgents();
  }, []);

  let updateAgentLocally = (oldUsername: string, newUsername: string, newName: string, newType: "ADMIN" | "NORMAL") => {
    for (let row of agents) {
      if (row.username == oldUsername) {
        row.username = newUsername;
        row.name = newName;
        row.type = newType;
        return;
      }
    }
  }

  let updateUserRequest = async (oldUsername: string, newUsername: string, newName: string, newType: "ADMIN" | "NORMAL") => 
    {
      if (!token) return;
      let response = await fetch("/api/updateAgent", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldUsername: oldUsername,
          newUsername: newUsername,
          newName: newName,
          newType: newType,
        })
      });
      if (response.status == 200) {
        return true;
      } else {
        console.log("Cannot update agent");
        return false;
      }
    }
    

  let endEditingUsers = () => {
    for (let row of agents) {
      const usernameDiv = document.getElementById("username_" + row.username);
      const nameDiv = document.getElementById("name_" + row.username);
      const typeDiv = document.getElementById("type_" + row.username);

      if (!usernameDiv || !nameDiv || !typeDiv) {
        continue;
      }
      usernameDiv.innerHTML = row.username;
      nameDiv.innerHTML = row.name;
      typeDiv.innerHTML = row.type;
    }
  }

  let startEditingUsers = () => {
    for (let row of agents) {
      const usernameDiv = document.getElementById("username_" + row.username);
      const nameDiv = document.getElementById("name_" + row.username);
      const typeDiv = document.getElementById("type_" + row.username);

      if (!usernameDiv || !nameDiv || !typeDiv) {
        continue;
      }

      usernameDiv.innerHTML = `<input type="text"></input>`
      if (usernameDiv.firstChild) (usernameDiv.firstChild as HTMLInputElement).value = row.username;
      usernameDiv.firstChild?.addEventListener("change", async (e) => {
        const newUsername = (e.target as HTMLInputElement).value;
        let validationError1 = Validations.validateUniqueChange(agents.map((user) => user.username), row.username, newUsername);
        if (validationError1 != "") {
          setErrorMessage(validationError1);
          return;
        }
        validationError1 = Validations.validateUsername(newUsername);
        if (validationError1 != "") {
          setErrorMessage(validationError1);
          return;
        }
          setErrorMessage("");
          let result = await updateUserRequest(row.username, newUsername, row.name, row.type);
          if (result) {
            setServerResponseMessage("User updated");
            setServerResponseMessageColor("green");
            updateAgentLocally(row.username, newUsername, row.name, row.type);
          } else {
            setErrorMessage("Cannot update agent");
        }
      })

      nameDiv.innerHTML = `<input type="text"></input>`
      if (nameDiv.firstChild) (nameDiv.firstChild as HTMLInputElement).value = row.name;
      nameDiv.firstChild?.addEventListener("change", async (e) => {
        const newName = (e.target as HTMLInputElement).value;
        let validationError1 = Validations.validateUniqueChange(agents.map((user) => user.name), row.name, newName);
        if (validationError1 != "") {
          setErrorMessage(validationError1);
          return;
        }
        validationError1 = Validations.validateName(newName);
        if (validationError1 != "") {
          setErrorMessage(validationError1);
          return;
        }
          setErrorMessage("");
          let result = await updateUserRequest(row.username, row.username, newName, row.type);
          if (result) {
            setServerResponseMessage("User updated");
            setServerResponseMessageColor("green");
            updateAgentLocally(row.username, row.username, newName, row.type);
          } else {
            setErrorMessage("Cannot update agent");
          }
      })
      
      typeDiv.innerHTML = `<input type="text"></input>`
      if (!typeDiv.firstChild) return;
      (typeDiv.firstChild as HTMLInputElement).value = row.type;
      typeDiv.firstChild?.addEventListener("change", async (e) => {
        const newType = (e.target as HTMLInputElement).value.toUpperCase();
        const validationError1 = Validations.validateUserType(newType);
        if (validationError1 != "") {
          setErrorMessage(validationError1);
        } else {
          setErrorMessage("");
          let result = await updateUserRequest(row.username, row.username, row.name, newType as ("ADMIN" | "NORMAL"));
          if (result) {
            setServerResponseMessage("User updated");
            setServerResponseMessageColor("green");
            updateAgentLocally(row.username, row.username, row.name, newType as ("ADMIN" | "NORMAL"));
          } else {
            setErrorMessage("Cannot update agent");
          }
        }
      })

    }
  }

  
    let toggleEditButton = () => {
      if (editing) {
        setEditing(false);
        endEditingUsers();
      } else {
        setEditing(true);
        startEditingUsers();
      }
    }    

  return (
    <PopUp onClose={() => setShown(false)}>
      <h5>Manage Users</h5>
      <div style={{ display: "flex" }}>
        <div style={{ flexDirection: "column", width: "400px" }}>
          <div style={{ height: "250px", overflowY: "scroll" }}>
            {agents.length > 0 && (
              <DataTable clearSelectedRows={clearSelectedRows} data={agents} columns={columns} highlightOnHover={true} selectableRows onSelectedRowsChange={e => {setSelectedRows(e.selectedRows); console.log(e.selectedCount)}}></DataTable>
            )}
          </div>
          <form onSubmit={addUserSubmit} style={{ marginTop: "10px", display: "flex" }}>
            <input disabled={!addFormEnabled} style={{ width: "100px" }} type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
            <input disabled={!addFormEnabled} style={{ width: "100px" }} type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input disabled={!addFormEnabled} style={{ width: "100px" }} type="text" placeholder="Type" value={userType} onChange={(e) => setUserType(e.target.value.toUpperCase())} />
            <input disabled={!addFormEnabled} style={{ width: "100px" }} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button disabled={!addFormEnabled}  className="button-mu">Add</button>
          </form>
        </div>

        <div style={{ marginLeft: "0px" }}>
          <div style={{ height: "260px" }}>
            <button onClick={triggerAddUser} className="button-mu" style={{ width: "132px" }}>{addFormEnabled ? "Cancel" : "Add user"}</button>
            <button onClick={removeSelectedUsers} disabled={!removeButtonEnabled} className="button-mu" style={{ width: "132px" }}>{removeUsersButtonText}</button>
            <button onClick={toggleEditButton} className="button-mu" style={{ width: "132px" }}>{"Edit users"}</button>
            <div>
            {errorMessage && <p className="error">{errorMessage}</p>}
            {serverResponseMessage && <p className="server-response" style={{color: serverResponseMessageColor}}>{serverResponseMessage}</p>}
            </div>
          </div>
        </div>
      </div>

      <></>
    </PopUp>
  );
};


export default ManageUsers;
