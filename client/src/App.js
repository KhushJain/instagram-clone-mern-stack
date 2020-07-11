import React, { useEffect, createContext, useReducer, useContext } from 'react';
import Navbar from './components/Navbar';
import './App.css';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import Home from './components/screens/Home';
import Signin from './components/screens/Signin';
import Profile from './components/screens/Profile';
import Signup from './components/screens/Signup';
import CreatePost from './components/screens/CreatePost';
import UserProfile from './components/screens/UserProfile';
import SubscribedUserPosts from './components/screens/SubscribedUserPosts';
import Reset from './components/screens/Reset';
import Newpassword from './components/screens/Newpassword';
import Post from './components/screens/Post';
import { reducer, initialState } from './reducers/userReducer';

export const UserContext = createContext();

const Routing = () => {
  const history = useHistory();
  const { state, dispatch } = useContext(UserContext);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (user) {
      dispatch({type:"USER", payload: user});
    }
    else {
      if(!history.location.pathname.startsWith('/reset')) 
        history.push('/signin');
    }
  }, []);

  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/signin" component={Signin} />
      <Route path="/signup" component={Signup} />
      <Route path="/profile" exact component={Profile} />
      <Route path="/create" component={CreatePost} />
      <Route path="/profile/:userid" component={UserProfile} />
      <Route path="/myfollowingposts" component={SubscribedUserPosts} />
      <Route path="/reset" exact component={Reset} />
      <Route path="/reset/:token" component={Newpassword} />
      <Route path="/post/:postid" component={Post} />
    </Switch>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <UserContext.Provider value={{state, dispatch}}>
      <Router>
        <Navbar />
        <Routing />
      </Router>
    </UserContext.Provider>
  );
}

export default App;
