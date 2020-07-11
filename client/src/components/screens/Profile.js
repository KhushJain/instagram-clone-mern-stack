import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../App';
import axios from 'axios';
import M from 'materialize-css';
import Spinner from '../Spinner';
import { useHistory, Link } from 'react-router-dom';


const Profile = () => {

    const [mypics, setMyPics] = useState([]);
    const {state, dispatch} = useContext(UserContext);
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const history = useHistory();

    useEffect(() => {
        setLoading(true);
        axios.get('/mypost', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => {
            setMyPics(res.data.myposts)
            setLoading(false);
        })
        .catch(e => {
            setLoading(false);
            console.log(e);
        });

    }, [])


    useEffect(() => {
        if(image) {
            setLoadingProfile(true);
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
                
                axios.put('/updateprofilephoto', { profilePhoto: data.url }, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem("jwt")
                    }
                })
                .then(res => {
                    localStorage.setItem("user", JSON.stringify({...state, profilePhoto: res.data.profilePhoto}));
                    dispatch({ type:"UPDATEPROFILEPHOTO", payload: res.data.profilePhoto });
                    M.toast({html: "Profile Pic Updated!", classes:"#43a047 green darken-1"});
                    //window.location.reload();
                    setLoadingProfile(false);
                })
            })
            .catch(e => {
                setLoadingProfile(false);
                console.log(e);
            });
        }
    }, [image])


    const deleteUser = () => {
        axios.delete('/deleteaccount', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => {
            localStorage.clear()
            dispatch({type:"CLEAR"})
            M.toast({html: res.data.message, classes:"#43a047 green darken-1"});
            history.push('/signin');
        })
        .catch(e => {
            M.toast({html: "Something went wrong, try again!", classes:"#c62828 red darken-3"});
            console.log(e)
        })
    };


    let display = (
        <>
        <div style={{ margin: "18px 0px", borderBottom: "1px solid grey" }}>
            <div style={{ display:"flex", justifyContent:"space-around" }}>
                <div>
                    {loadingProfile ? <Spinner /> :
                        <img style={{ width: "160px", height: "160px", borderRadius:"80px" }} src={state? state.profilePhoto : 'Loading...'} />
                    }
                </div>
                <div>
                    <h4>{state?state.name:"Loading..."}</h4>
                    <h5>{state?state.email:"Loading..."}</h5>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "108%" }}>
                        <h6>{mypics.length} posts</h6>
                        <h6>{state? state.followers.length: "0"} followers</h6>
                        <h6>{state? state.following.length: "0"} following</h6>
                    </div>
                </div>
            </div>
            <div className="file-field input-field" style={{ margin:"10px", marginLeft: "33px" }}>
                <div className="btn #212121 grey darken-4">
                    <span>Edit Profile Photo</span>
                    <input type="file" id="file-input-value" onChange={(e)=>setImage(e.target.files[0])} />
                </div>
                <div className="file-path-wrapper">
                    <input className="file-path validate" type="text" />
                </div>
            </div>
            <button style={{ marginLeft: "40px", marginBottom: "7px" }} className="btn waves-effect waves-light #b71c1c red darken-4" onClick={() => {if(window.confirm("Are you sure to delete this account? This action can't be undone!")){ deleteUser()};}} >Delete Account</button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
            {
                mypics.map(item => (
                    
                    <img key={item._id} style={{ width: "30%", cursor:"pointer" }} src={item.photo} alt={item.title} onClick={() => { history.push(`/post/${item._id}`) }}/>

                ))
            }
        </div>
        </>
    );

    if (loading) display = <Spinner />;

    
    return (
        <div style={{ maxWidth: "550px", margin: "0px auto" }}>
            {display}
        </div>

    )
};

export default Profile;