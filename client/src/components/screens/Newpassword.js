import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import M from 'materialize-css';
import Spinner from '../Spinner';

const Newpassword = () => {

    const history = useHistory();
    const [password, setPassword] = useState("");
    const { token } = useParams();
    const [loading, setLoading] = useState(false);

    const postData = () => {
        setLoading(true);
        axios.post("/newpassword", { password, token }, { headers: { "Content-Type": "application/json" }})
            .then(response => {
                if (response.data.error) {
                    M.toast({html: response.data.error, classes:"#c62828 red darken-3"});
                }
                else {
                    M.toast({html: response.data.message, classes:"#43a047 green darken-1"});
                    history.push('/signin');
                }      
                setLoading(false);      
            })
            .catch(e =>{
                setLoading(false);
                console.log(e);
            });
        };


        let display = (
            <div className="card auth-card input-field">
                <h2>Worldia</h2>
                <input type="password" placeholder="enter a new password" value={password} onChange={(event) => setPassword(event.target.value)} />
                <button className="btn waves-effect waves-light #64b5f6 blue darken-1" onClick={() => postData()} >Update Password</button>
            </div>
        );

        if (loading) display = <Spinner />;
        

    return (
        <div className="mycard">
            {display}
        </div>
    )
};

export default Newpassword;