import React, { useState, useEffect } from 'react';
import ConnectionProvider from '../backend/dbConnection';
import Sidebar from './Sidebar';
import Header from './Header';
import FirstRegister from './FirstRegister';
import './Home.css';



const Home: React.FC = () => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState<number | null>(null);

  //const data [] = {}, ]; 
  
  useEffect(() => {
    fetch("/api/usersNb", {
      method: "GET",
      headers: {'Content-Type': "application/json"}
    })
    .then(res => res.json()
    .then(body => setCount(body.usersnb)));
    
    
  }, []);

    
 


  return (
    <>
      {count === null && ""}
      {count === 0 && 
      (
        <div>
          <FirstRegister setUsersCount={setCount} />
        </div>
      )}
      {count !== null && count > 0 && 
      ( <div>
        <div>
        <Sidebar />
        </div>

        <div className="content">}
           <Header />
           <h1>----</h1>
          <table>
            <thead>
              <tr>
                <th>TARJETA</th>
                <th>NIT</th>
                <th>NOMBRE</th>
                <th>TEL_CORRESPONDENCIA</th>
                <th>FECHA_EMISIÓN</th>
                <th>column6</th>
                <th>column7</th>
                <th>ULTIMA_FECHA</th>
                <th>ULTIMA_VALOR_PAGO</th>
                <th>TIPO_IDENTIF_DEUDOR</th>
                <th>FECHA_CASTIGO</th>
              </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.TARJETA}>
                <td>{row.TARJETA}</td>
                <td>{row.NIT}</td>
                <td>{row.NOMBRE}</td>
                <td>{row.TEL_CORRESPONDENCIA}</td>
                <td>{row.FECHA_EMISIÓN}</td>
                <td>{row.column6}</td>
                <td>{row.column7}</td>
                <td>{row.ULTIMA_FECHA}</td>
                <td>{row.ULTIMA_VALOR_PAGO}</td>
                <td>{row.TIPO_IDENTIF_DEUDOR}</td>
                <td>{row.FECHA_CASTIGO}</td>
              </tr>
            ))}
          </tbody>
        </table>

        </div>

        </div>)}
    </>
  );
    /*
      <Sidebar />
      <div className="content">
        <Header />
        <h1>----</h1>
        <table>
          <thead>
            <tr>
              <th>TARJETA</th>
              <th>NIT</th>
              <th>NOMBRE</th>
              <th>TEL_CORRESPONDENCIA</th>
              <th>FECHA_EMISIÓN</th>
              <th>column6</th>
              <th>column7</th>
              <th>ULTIMA_FECHA</th>
              <th>ULTIMA_VALOR_PAGO</th>
              <th>TIPO_IDENTIF_DEUDOR</th>
              <th>FECHA_CASTIGO</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.TARJETA}>
                <td>{row.TARJETA}</td>
                <td>{row.NIT}</td>
                <td>{row.NOMBRE}</td>
                <td>{row.TEL_CORRESPONDENCIA}</td>
                <td>{row.FECHA_EMISIÓN}</td>
                <td>{row.column6}</td>
                <td>{row.column7}</td>
                <td>{row.ULTIMA_FECHA}</td>
                <td>{row.ULTIMA_VALOR_PAGO}</td>
                <td>{row.TIPO_IDENTIF_DEUDOR}</td>
                <td>{row.FECHA_CASTIGO}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  */

};

export default Home;
/*

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header'; // Import Header component
import './Home.css';

const Home: React.FC = () => {
  const data = [
    { id: 1, name: 'John Doe', age: 28, occupation: 'Engineer' },
    { id: 2, name: 'Jane Smith', age: 34, occupation: 'Doctor' },
    { id: 3, name: 'Alice Johnson', age: 45, occupation: 'Teacher' },
  ];

  const [selectedRow, setSelectedRow] = useState<{ id: number; name: string; age: number; occupation: string } | null>(null);

  const handleRowClick = (row: { id: number; name: string; age: number; occupation: string }) => {
    setSelectedRow(row);
  };

  return (
    <div className="home-container">
      <Sidebar selectedRow={selectedRow} />
      <div className="content">
        <Header /> 
        <h1>Data Table</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Occupation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} onClick={() => handleRowClick(row)}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.age}</td>
                <td>{row.occupation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;

*/