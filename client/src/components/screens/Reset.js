import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import M from 'materialize-css';

const Reset = () => {

    const history = useHistory();
    const [email, setEmail] = useState("");

    const resetPassword = () => {

        axios.post("/resetpassword", { email }, { headers: { "Content-Type": "application/json" }})
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
                <input type="text" placeholder="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <button className="btn waves-effect waves-light #64b5f6 blue darken-1" onClick={() => resetPassword()} >Reset Password</button>
            </div>
        </div>
    )
};

export default Reset;