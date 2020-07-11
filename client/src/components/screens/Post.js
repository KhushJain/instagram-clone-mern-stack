import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../../App';
import { Link, useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import M from 'materialize-css';
import Spinner from '../Spinner';

const Home = () => {

    const history = useHistory();
    const likesModalProfile = useRef(null);
    const { postid } = useParams();
    const [data, setData] = useState('');
    const { state, dispatch } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [likedUserDetails, setLikedUserDetails] = useState([]);

    useEffect(() => {
        setLoading(true);
        axios.get(`/post/${postid}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(result => {
            setData(result.data.post);
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
            setData(res.data);
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
            setData(res.data);
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
            setData(res.data);
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
            history.push('/profile');
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
            setData(res.data.result);
            M.toast({html: res.data.message, classes:"#43a047 green darken-1"});
        })
        .catch(e => {
            console.log(e)
        })
    };


    const likedUsers = (postId) => {
        M.Modal.init(likesModalProfile.current);
        axios.post('/likedusers', { postId }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => {
            setLikedUserDetails(res.data.users);
            M.Modal.getInstance(likesModalProfile.current).open();
        })
        .catch(e => {
            console.log(e);
        })
    };


    // let display = (
    //     <>

    //     </>
    // );

    // if (loading) display = <Spinner />;


    return (
        <>
        {data ?
            <div>
            <div className="card home-card" key={data._id}>
                <h5 style={{ padding: '5px' }}><Link to={data.postedBy._id !== state._id ? "/profile/" + data.postedBy._id : "/profile"}><img style={{ width: "30px", height: "30px", borderRadius:"15px" }} src={data.postedBy.profilePhoto} /> {data.postedBy.name} </Link>
                    {
                        data.postedBy._id === state._id
                        &&<i className="material-icons" style={{ float: "right", cursor:"pointer" }} onClick={() => {if(window.confirm("Are you sure to delete this post? This action can't be undone!")){ deletePost(data._id)};}} >delete</i>
                    }
                </h5>
                <div className="card-image">
                    <img src={data.photo} />
                </div>
                <div className="card-content">
                    {
                        data.likes.includes(state._id)
                        ? <i className="material-icons" style={{ cursor:"pointer" }} onClick={() => unlikePost(data._id)}>thumb_down</i>
                        : <i className="material-icons" style={{ cursor:"pointer" }} onClick={() => likePost(data._id)}>thumb_up</i>
                    }
                    <h6 data-target="modalLikesProfile" className="modal-trigger" style={{ cursor: "pointer" }} onClick={() => likedUsers(data._id)} >{data.likes.length} <i className="material-icons" style={{ color: "red" }}>favorite</i></h6>
                    <h6>{data.title}</h6>
                    <p>{data.body}</p>
                    {
                        data.comments.map(res => (
                        <h6 key={res._id}><span style={{ fontWeight: "500" }}>{res.postedBy.name}:</span> {res.text}
                        {
                            res.postedBy._id === state._id
                            &&<i className="material-icons" style={{ float: "right", cursor:"pointer" }} onClick={() => deleteComment(data._id, res._id)} >delete</i>
                        }
                        </h6>
                        
                        ))
                    }
                    <form onSubmit={(event) => {
                        event.preventDefault()
                        makeComment(event.target[0].value, data._id)
                        event.target[0].value = ''
                    }}>
                        <input type="text" placeholder="Add comment" />
                    </form>
                    
                </div>
            </div>

            <div id="modalLikesProfile" className="modal" ref={likesModalProfile} style={{ color: "black" }}>
                <div className="modal-content">
                    <h5>Liked by: </h5>
                    {likedUserDetails ?
                    <ul className="collection">
                        { likedUserDetails.map(data => {
                            return <Link key={data._id} to={data._id === state._id ? "/profile" : "/profile/" + data._id} onClick={() => {
                            setLikedUserDetails([]);
                            M.Modal.getInstance(likesModalProfile.current).close();
                            M.Modal.getInstance(likesModalProfile.current).destroy();
                            }}>
                            <li className="collection-item">{data.name} - {data.email}</li>
                            </Link>   
                    }) }
                    </ul>
                    :<></>  
                    }
                </div>
                <div className="modal-footer">
                    <button className="modal-close waves-effect waves-green btn-flat" onClick={() => {setLikedUserDetails([]); M.Modal.getInstance(likesModalProfile.current).destroy(); }}>close</button>
                </div>
            </div>
            </div>
        : <Spinner />
        }
        </>
    )
};

export default Home;