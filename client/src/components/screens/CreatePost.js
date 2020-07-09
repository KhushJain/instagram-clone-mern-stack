import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import M from 'materialize-css';
import Spinner from '../Spinner';


const CreatePost = () => {

    const history = useHistory();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if(url) {
            axios.post("/createpost", { title, body, picUrl: url }, { 
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": "Bearer " + localStorage.getItem("jwt") 
                }})
                .then(response => {
                    if (response.data.error) {
                        M.toast({html: response.data.error, classes:"#c62828 red darken-3"});
                    }
                    else {
                        M.toast({html: response.data.message, classes:"#43a047 green darken-1"});
                        history.push('/');
                    }           
                    setLoading(false); 
                })
                .catch(e =>{
                    setLoading(false);
                    console.log(e);
                });
        }
    }, [url]);

    const postDetails = () => {
        if (!image || !title || !body) {
            M.toast({html: 'Please add all the fields!', classes:"#c62828 red darken-3"});
        } else {
            setLoading(true);
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
                setLoading(false);
                console.log(e);
            });
        }
    };


    let display = (
        <>
            <input type="text" placeholder="title" value={title} onChange={(event) => setTitle(event.target.value)} />
            <input type="text" placeholder="body" value={body} onChange={(event) => setBody(event.target.value)} />
            <div className="file-field input-field">
                <div className="btn #64b5f6 blue darken-1">
                    <span>Upload Image</span>
                    <input type="file" onChange={(event) => setImage(event.target.files[0])} />
                </div>
                <div className="file-path-wrapper">
                    <input className="file-path validate" type="text" />
                </div>
            </div>
            <button onClick={() => postDetails()} className="btn waves-effect waves-light #64b5f6 blue darken-1">Submit Post</button>
        </>
    );

    if (loading) display = <Spinner />


    return (
        <div className="card input-filed" style={{ margin: "30px auto", maxWidth: "500px", padding: "20px", textAlign:"center" }}>
            {display}
        </div>
    );
};

export default CreatePost;