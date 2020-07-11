import React, { useEffect, useState, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { UserContext } from '../../App';
import axios from 'axios';
import Spinner from '../Spinner';

const UserProfile = () => {

    const history = useHistory();
    const [userProfile, setUserProfile] = useState(null);
    const { state, dispatch } = useContext(UserContext);
    const { userid } = useParams();
    const [showFollow, setShowFollow] = useState(state?!state.following.includes(userid):true);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        setLoading(true);
        axios.get(`/user/${userid}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => {
            setUserProfile(res.data)
            setLoading(false);
        })
        .catch(e => {
            setLoading(false);
            console.log(e);
        })

    }, [])


    const followUser = () => {
        axios.put('/follow', { followid: userid }, {
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": "Bearer " + localStorage.getItem("jwt") 
            }
        })
        .then(data => {
            dispatch({ type:"UPDATE", payload: data.data });
            localStorage.setItem("user", JSON.stringify(data.data));
            setUserProfile((prevState) => {
                return {
                    ...prevState,
                    user: {
                        ...prevState.user,
                        followers: [...prevState.user.followers, data.data._id]
                    }
                };
            });
            setShowFollow(false);
        })
        .catch(e => {
            console.log(e);
        })
    };


    const unfollowUser = () => {
        axios.put('/unfollow', { unfollowid: userid }, {
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": "Bearer " + localStorage.getItem("jwt") 
            }
        })
        .then(data => {
            dispatch({ type:"UPDATE", payload: data.data });
            localStorage.setItem("user", JSON.stringify(data.data));
            setUserProfile((prevState) => {
                const newFollowers = prevState.user.followers.filter(item => item !== data.data._id)

                return {
                    ...prevState,
                    user: {
                        ...prevState.user,
                        followers: newFollowers
                    }
                };
            });
            setShowFollow(true);
        })
        .catch(e => {
            console.log(e);
        })
    };


    let display = (
        <>
        {userProfile ? 
                <div style={{ maxWidth: "550px", margin: "0px auto" }}>
                <div style={{ display: "flex", justifyContent: "space-around", margin: "18px 0px", borderBottom: "1px solid grey" }}>
                    <div>
                        <img style={{ width: "160px", height: "160px", borderRadius:"80px" }} src={ userProfile.user.profilePhoto } />
                    </div>
                    <div>
                        <h4>{userProfile.user.name}</h4>
                        <h5>{userProfile.user.email}</h5>
                        <div style={{ display: "flex", justifyContent: "space-between", width: "108%" }}>
                            <h6>{userProfile.posts.length} posts</h6>
                            <h6>{userProfile.user.followers.length} followers</h6>
                            <h6>{userProfile.user.following.length} following</h6>
                        </div>
                        {showFollow ? 
                            <button style={{ margin: "10px" }} className="btn waves-effect waves-light #64b5f6 blue darken-1" onClick={() => followUser()} >Follow</button>
                            : <button style={{ margin: "10px" }} className="btn waves-effect waves-light #64b5f6 blue darken-1" onClick={() => unfollowUser()} >Unfollow</button>
                        }
                    </div>
                </div>
                
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
                    {
                        userProfile.posts.map(item => (
                            <img key={item._id} style={{ width: "30%", cursor:"pointer" }} src={item.photo} alt={item.title}  onClick={() => { history.push(`/post/${item._id}`) }}/>
    
                        ))
                    }
                </div>
            </div>
            : <h2>Loading...</h2>}

        </>
    );

    if (loading) display = <Spinner />;


    return (
        <>
        {display}
        </>
    )
};

export default UserProfile;