import React, { useContext, useRef, useEffect, useState } from 'react';
import { UserContext } from '../App';
import { Link, useHistory } from 'react-router-dom';
import M from 'materialize-css';
import axios from 'axios';

const Navbar = () => {

  const searchModal = useRef(null);
  const [search, setSearch] = useState('');
  const [usersDetails, setUsersDetails] = useState([]);
  const {state, dispatch} = useContext(UserContext);
  const history = useHistory();


  useEffect(() => {
    M.Modal.init(searchModal.current);
    let sidenav = document.querySelector('#mobile-links');
    M.Sidenav.init(sidenav, {});
  }, [])


  const renderList = () => {
    if (state) {
      return [
        <li className="sidenav-close" key="1"><i data-target="modal1" className="large material-icons modal-trigger" style={{ color: "black", cursor:"pointer" }}>search</i></li>,
        <li className="sidenav-close" key="2"><Link to="/profile">Profile</Link></li>,
        <li className="sidenav-close" key="3"><Link to="/create">Create Post</Link></li>,
        <li className="sidenav-close" key="4"><Link to="/myfollowingposts">My Following Posts</Link></li>,
        <li className="sidenav-close" key="5">
          <button className="btn #c62828 red darken-3"
            onClick={() =>{
                localStorage.clear()
                dispatch({type:"CLEAR"})
                M.toast({html: "Successfully Logged Out", classes:"#43a047 green darken-1"});
                history.push('/signin');
              }} >
              Logout</button>
        </li>
      ];
    } else {
        return [
          <li className="sidenav-close" key="6"><Link to="/signin">Sign in</Link></li>,
          <li className="sidenav-close" key="7"><Link to="/signup">Sign up</Link></li>
        ];
    }
  };


  const fetchUsers = (query) => {
    setSearch(query);
    axios.post('/searchusers', { query }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("jwt")
      }
    })
    .then(res => {
      setUsersDetails(res.data.users);
    })
    .catch(e => {
      console.log(e);
    })
  };


  return (
    <>
      <nav>
      <div className="nav-wrapper white">
        <Link to={state?"/": "/signin"} className="brand-logo">Worldia</Link>
        <a href="#" className="sidenav-trigger" data-target="mobile-links">
          <i className="material-icons">menu</i>
        </a>
        <ul id="nav-mobile" className="right hide-on-med-and-down">
          {renderList()}
        </ul>
      </div>
      <div id="modal1" className="modal" ref={searchModal} style={{ color: "black" }}>
        <div className="modal-content">
          <input type="text" placeholder="search users by email" value={search} onChange={(event) => fetchUsers(event.target.value.toLowerCase())} />
          {state ?
          <ul className="collection">
            { usersDetails.map(item => {
                return <Link key={item._id} to={item._id === state._id ? "/profile" : "/profile/" + item._id} onClick={() => {
                  M.Modal.getInstance(searchModal.current).close()
                  setSearch('');
                  setUsersDetails([]);
                }}>
                  <li className="collection-item">{item.name} - {item.email}</li>
                </Link>   
          }) }
          </ul>
          :<></>  
          }
        </div>
        <div className="modal-footer">
          <button className="modal-close waves-effect waves-green btn-flat" onClick={() => { setSearch(''); setUsersDetails([]) }}>close</button>
        </div>
      </div>
    </nav>
    <ul className="sidenav" id="mobile-links">
      {renderList()}
    </ul>
    </>
  );
};


export default Navbar;