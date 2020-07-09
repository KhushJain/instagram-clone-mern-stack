import React, { useContext } from 'react';
import { UserContext } from '../App';
import { Link, useHistory } from 'react-router-dom';
import M from 'materialize-css';

const Navbar = () => {

  const {state, dispatch} = useContext(UserContext);
  const history = useHistory();
  const renderList = () => {
    if (state) {
      return [
        <li><Link to="/profile">Profile</Link></li>,
        <li><Link to="/create">Create Post</Link></li>,
        <li><Link to="/myfollowingposts">My Following Posts</Link></li>,
        <li>
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
          <li><Link to="/signin">Sign in</Link></li>,
          <li><Link to="/signup">Sign up</Link></li>
        ];
    }
  };

    return (
        <nav>
        <div className="nav-wrapper white">
          <Link to={state?"/": "/signin"} className="brand-logo left">Instagram</Link>
          <ul id="nav-mobile" className="right">
            {renderList()}
          </ul>
        </div>
      </nav>
    );
};

export default Navbar;