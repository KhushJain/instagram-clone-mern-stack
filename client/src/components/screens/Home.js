import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import { Link } from 'react-router-dom';
import axios from 'axios';
import M from 'materialize-css';

const Home = () => {

    const [data, setData] = useState([]);
    const { state, dispatch } = useContext(UserContext);
    
    useEffect(() => {
        axios.get('/allpost', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(result => {
            setData(result.data.posts);
        })
        .catch(e => {
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


    return (
        <div>
            {
                data.map(item => (
                    <div className="card home-card" key={item._id}>
                        <h5 style={{ padding: '5px' }}><Link to={item.postedBy._id !== state._id ? "/profile/" + item.postedBy._id : "/profile"}>{item.postedBy.name} </Link>
                            {
                                item.postedBy._id === state._id
                                &&<i className="material-icons" style={{ float: "right", cursor:"pointer" }} onClick={() => deletePost(item._id)} >delete</i>
                            }
                        </h5>
                        <div className="card-image">
                            <img src={item.photo} />
                        </div>
                        <div className="card-content">
                            {
                                item.likes.includes(state._id)
                                ? <i className="material-icons" style={{ cursor:"pointer" }} onClick={() => unlikePost(item._id)}>thumb_down</i>
                                : <i className="material-icons" style={{ cursor:"pointer" }} onClick={() => likePost(item._id)}>thumb_up</i>
                            }
                            <h6>{item.likes.length} <i className="material-icons" style={{ color: "red" }}>favorite</i></h6>
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
        </div>
    )
};

export default Home;