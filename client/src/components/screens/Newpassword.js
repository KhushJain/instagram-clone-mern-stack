import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import M from 'materialize-css';

const Newpassword = () => {

    const history = useHistory();
    const [password, setPassword] = useState("");
    const { token } = useParams();

    const postData = () => {

        axios.post("/newpassword", { password, token }, { headers: { "Content-Type": "application/json" }})
            .then(response => {
                if (response.data.error) {
                    M.toast({html: response.data.error, classes:"#c62828 red darken-3"});
                }
                else {
                    M.toast({html: response.data.message, classes:"#43a047 green darken-1"});
                    history.push('/signin');
                }            
            })
            .catch(e =>{
                console.log(e);
            });
        };

    return (
        <div className="mycard">
            <div className="card auth-card input-field">
                <h2>Instagram</h2>
                <input type="password" placeholder="enter a new password" value={password} onChange={(event) => setPassword(event.target.value)} />
                <button className="btn waves-effect waves-light #64b5f6 blue darken-1" onClick={() => postData()} >Update Password</button>
            </div>
        </div>
    )
};

export default Newpassword;