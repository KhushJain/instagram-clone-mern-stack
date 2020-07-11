import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../../App';
import { Link } from 'react-router-dom';
import axios from 'axios';
import M from 'materialize-css';
import Spinner from '../Spinner';

const Home = () => {

    const likesModalSubscribed = useRef(null);
    const [data, setData] = useState([]);
    const { state, dispatch } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [likedUserDetails, setLikedUserDetails] = useState([]);
    
    useEffect(() => {
        setLoading(true);
        axios.get('/getsubscribedposts', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(result => {
            setData(result.data.posts);
            setLoading(false);
        })
        .catch(e => {
            setLoading(false);
            console.log(e);
        })

    }, [])


    const likePost = (postId) => {
        axios.put('/like', {
            postId: postId
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => {
            const newData = data.map(item => {
                if (item._id === res.data._id)
                    return res.data
                return item
            })
            setData(newData);
        })
        .catch(e => {
            console.log(e);
        })
    };


    const unlikePost = (postId) => {
        axios.put('/unlike', {
            postId: postId
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => {
            const newData = data.map(item => {
                if (item._id === res.data._id)
                    return res.data
                return item
            })
            setData(newData);
        })
        .catch(e => {
            console.log(e);
        })
    };


    const makeComment = (text, postId) => {
        axios.put('/comment', {
            text: text,
            postId: postId 
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => {
            const newData = data.map(item => {
                if (item._id === res.data._id)
                    return res.data
                return item
            })
            setData(newData);
        })
        .catch(e => {
            console.log(e)
        })
    };


    const deletePost = (postId) => {
        axios.delete(`/deletepost/${postId}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => {
            const newData = data.filter(item=>{
                return item._id !== res.data.result._id
            })
            setData(newData)
            M.toast({html: res.data.message, classes:"#43a047 green darken-1"});
        })
        .catch(e => {
            console.log(e)
        })
    };


    const deleteComment = (postId, commentId) => {
        axios.delete(`/deletecomment/${postId}/${commentId}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => {
            const newData = data.map(item => {
                if (item._id === res.data.result._id)
                    return res.data.result
                return item
            })
            setData(newData);
            M.toast({html: res.data.message, classes:"#43a047 green darken-1"});
        })
        .catch(e => {
            console.log(e)
        })
    };


    const likedUsers = (postId) => {
        M.Modal.init(likesModalSubscribed.current);
        axios.post('/likedusers', { postId }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => {
            setLikedUserDetails(res.data.users);
            M.Modal.getInstance(likesModalSubscribed.current).open();
        })
        .catch(e => {
            console.log(e);
        })
    };


    let display = (
        <>
            {
                data.map(item => (
                    <div className="card home-card" key={item._id}>
                        <h5 style={{ padding: '5px' }}><Link to={item.postedBy._id !== state._id ? "/profile/" + item.postedBy._id : "/profile"}><img style={{ width: "30px", height: "30px", borderRadius:"15px" }} src={item.postedBy.profilePhoto} /> {item.postedBy.name} </Link>
                            {
                                item.postedBy._id === state._id
                                &&<i className="material-icons" style={{ float: "right", cursor:"pointer" }} onClick={() => deletePost(item._id)} >delete</i>
                            }
                        </h5>
                        <div className="card-image">
                            <Link to={"post/" + item._id} >
                                <img src={item.photo} />
                            </Link>
                        </div>
                        <div className="card-content">
                            {
                                item.likes.includes(state._id)
                                ? <i className="material-icons" style={{ cursor:"pointer" }} onClick={() => unlikePost(item._id)}>thumb_down</i>
                                : <i className="material-icons" style={{ cursor:"pointer" }} onClick={() => likePost(item._id)}>thumb_up</i>
                            }
                            <h6 data-target="modalLikesSubscribed" className="modal-trigger" style={{ cursor: "pointer" }} onClick={() => likedUsers(item._id)} >{item.likes.length} <i className="material-icons" style={{ color: "red" }}>favorite</i></h6>
                            <h6>{item.title}</h6>
                            <p>{item.body}</p>
                            {
                                item.comments.map(res => (
                                <h6 key={res._id}><span style={{ fontWeight: "500" }}>{res.postedBy.name}:</span> {res.text}
                                {
                                    res.postedBy._id === state._id
                                    &&<i className="material-icons" style={{ float: "right", cursor:"pointer" }} onClick={() => deleteComment(item._id, res._id)} >delete</i>
                                }
                                </h6>
                                
                                ))
                            }
                            <form onSubmit={(event) => {
                                event.preventDefault()
                                makeComment(event.target[0].value, item._id)
                                event.target[0].value = ''
                            }}>
                                <input type="text" placeholder="Add comment" />
                            </form>
                            
                        </div>
                    </div>
                ))
            }
            <div id="modalLikesSubscribed" className="modal" ref={likesModalSubscribed} style={{ color: "black" }}>
                <div className="modal-content">
                    <h5>Liked by: </h5>
                    {likedUserDetails ?
                    <ul className="collection">
                        { likedUserDetails.map(item => {
                            return <Link key={item._id} to={item._id === state._id ? "/profile" : "/profile/" + item._id} onClick={() => {
                            setLikedUserDetails([]);
                            M.Modal.getInstance(likesModalSubscribed.current).close();
                            M.Modal.getInstance(likesModalSubscribed.current).destroy();
                            }}>
                            <li className="collection-item">{item.name} - {item.email}</li>
                            </Link>   
                    }) }
                    </ul>
                    :<></>  
                    }
                </div>
                <div className="modal-footer">
                    <button className="modal-close waves-effect waves-green btn-flat" onClick={() => {setLikedUserDetails([]); M.Modal.getInstance(likesModalSubscribed.current).destroy(); }}>close</button>
                </div>
            </div>        
        </>
    );

    if (loading) display = <Spinner />;


    return (
        <div>
            {display}
        </div>
    )
};

export default Home;