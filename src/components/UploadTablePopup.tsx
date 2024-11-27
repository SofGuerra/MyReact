import React, { useEffect, useState } from 'react';
import './Header.css';
import Cookies from 'js-cookie';  
import PopUp from './PopUp';
import validations from '../validations';

interface UploadTablePopupProps {
    file: File
    setClosedCallback: Function,
    setCurrentTable: (n: number) => void;
}

const UploadTablePopup: React.FC <UploadTablePopupProps> = ({file, setClosedCallback, setCurrentTable}) => {

    const [distributed, setDistributed] = useState(false);
    const [createHeaders, setCreateHeaders] = useState(false);
    const [newTableName, setNewTableName] = useState("New Table");
    const [errorMessage, setErrorMessage] = useState("");


    const onUploadButtonClicked = () => {
        const token = Cookies.get("token");
        if (token === undefined) return;

        let errorMessage1 = validations.validateTableName(newTableName);
        if (errorMessage1 != "") {
            setErrorMessage(errorMessage1);
            return;
        }
        setErrorMessage("");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('distributed', String(distributed));
        formData.append('createHeaders', String(createHeaders));
        formData.append('tableName', newTableName);
        let response = fetch('/api/upload', {
            headers: {Authorization: token },
            method: 'POST',
            body: formData,
        }).then((res) => {
            res.json().then((body) => {
                console.log(body);
                setCurrentTable(body.tableId);
            });
            setClosedCallback();
        });
    }

    return (
        <PopUp onClose={() => {setClosedCallback()}}>
            <h2>Upload Table</h2><br/>
            <label>
                <input type="checkbox" checked={distributed} onChange={(e) => setDistributed(e.target.checked)}/>
                Distributed
            </label><br/>
            <label>
                <input type="checkbox" checked={createHeaders} onChange={(e) => setCreateHeaders(e.target.checked)}/>
                Create Headers
            </label><br/>
            <label>
                <input type="text" placeholder="Table Name" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} />    
            </label><br/>
            <button onClick={() => {onUploadButtonClicked()}}>Upload</button>
            {errorMessage != "" && (
                <div className="error">{errorMessage}</div>)}
        </PopUp>
    );
};

export default UploadTablePopup;
