import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import M from 'materialize-css';

const Signup = () => {
    
    const history = useHistory();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [image, setImage] = useState("");
    const [url, setUrl] = useState(undefined);


    useEffect(() => {
        if (url) {
            uploadFields();
        }
    }, [url])


    const uploadFields = () => {
        axios.post("/signup", { name, email, password, profilePhoto:url }, { headers: { "Content-Type": "application/json" }})
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
            })

        // if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
        //     M.toast({html: "Invalid Email", classes:"#c62828 red darken-3"});
        //     return ;
        // }
        // fetch("http://localhost:5000/signup", {
        //     method: "post",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({
        //         name,
        //         password,
        //         email
        //     })
        // }).then(response => response.json())
        // .then(data => {
        //     if (data.error) {
        //         M.toast({html: data.error, classes:"#c62828 red darken-3"});
        //     }
        //     else {
        //         M.toast({html: data.message, classes:"#43a047 green darken-1"});
        //         history.push('/signin');
        //     }
        // })
        // .catch(e =>{
        //     console.log(e);
        // })
    };


    const postData = () => {

        if (image) {
            uploadProfilePhoto();
        } else {
            uploadFields()
        }


    };


    const uploadProfilePhoto = () => {
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "insta-clone");
        data.append("cloud_name", "khush");

        fetch("	https://api.cloudinary.com/v1_1/khush/image/upload", {
            method: "post",
            body: data
        })
        .then(response => response.json())
        .then(data => {
            setUrl(data.url);
        })
        .catch(e => {
            console.log(e);
        });

    };


    return (
        <div className="mycard">
            <div className="card auth-card input-field">
                <h2>Instagram</h2>
                <input type="text" placeholder="name" value={name} onChange={(event) => setName(event.target.value)} />
                <input type="text" placeholder="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <input type="password" placeholder="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                <div className="file-field input-field">
                    <div className="btn #64b5f6 blue darken-1">
                        <span>Upload Profile Photo</span>
                        <input type="file" onChange={(event) => setImage(event.target.files[0])} />
                    </div>
                    <div className="file-path-wrapper">
                        <input className="file-path validate" type="text" />
                    </div>
                </div>                
                <button className="btn waves-effect waves-light #64b5f6 blue darken-1" onClick={() => postData()} >SignUp</button>
                <h6>Already have an account?<Link to="/signin"><span style={{ color: 'rgb(8, 93, 252)' }}> SignIn</span></Link></h6>
            </div>
        </div>
    )
};

export default Signup;