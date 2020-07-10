import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { UserContext } from '../../App';
import axios from 'axios';
import M from 'materialize-css';
import Spinner from '../Spinner';

const Signin = () => {

    const { state, dispatch } = useContext(UserContext);
    const history = useHistory();
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const postData = () => {
        setLoading(true);
        axios.post("/signin", { email, password }, { headers: { "Content-Type": "application/json" }})
            .then(response => {
                if (response.data.error) {
                    M.toast({html: response.data.error, classes:"#c62828 red darken-3"});
                }
                else {
                    localStorage.setItem("jwt", response.data.token);
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                    dispatch({type:"USER", payload: response.data.user});
                    M.toast({html: response.data.message, classes:"#43a047 green darken-1"});
                    history.push('/');
                }
                setLoading(false);            
            })
            .catch(e =>{
                setLoading(false);
                console.log(e);
            });
        };


        let display =  (
            <div className="card auth-card input-field">
                <h2>Worldia</h2>
                <input type="text" placeholder="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <input type="password" placeholder="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                <button className="btn waves-effect waves-light #64b5f6 blue darken-1" onClick={() => postData()} >Login</button>
                <h6><Link to="/reset" ><span style={{ color: 'rgb(8, 93, 252)' }}> Forgot password?</span></Link></h6>
                <h6>Don't have an account?<Link to="/signup" ><span style={{ color: 'rgb(8, 93, 252)' }}> SignUp</span></Link></h6>
            </div>
        );

        if (loading) display = <Spinner />;
    

    return (
        <div className="mycard">
            {display}
        </div>
    )
};

export default Signin;