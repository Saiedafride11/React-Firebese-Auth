import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}else {
  firebase.app(); // if already initialized, use that one
}

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error: '',
    success: false
  })
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();

  const handleSignIn = () =>{
    // console.log("handleSignIn");
    firebase.auth().signInWithPopup(googleProvider)
    .then(res => {
      const {displayName, email, photoURL} = res.user;
      const signedInUser = {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      setUser(signedInUser)
      // console.log(displayName, email, photoURL)
      // console.log(res)
    })
    .catch(err => {
      console.log(err);
      console.log(err.message);
    })
  }

  const handleFbSignIn = () => {
    firebase.auth().signInWithPopup(fbProvider)
    .then(res => {
      console.log('Facebook User', res)
      const {displayName, email, photoURL} = res.user;
      const signedInUser = {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      setUser(signedInUser)
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      console.log(errorCode, errorMessage, email, credential)
    });
  }

  const handleSignOut = () => {
    // console.log("handleSignOut");
    firebase.auth().signOut()
    .then(res => {
      const isSignedOutUser = {
        isSignedIn: false,
        name: '',
        email: '',
        photo: '',
      }
      setUser(isSignedOutUser)
    })
    .catch(err => {
      
    });
    
  }

  // const handleChange = (event) => {
  //   console.log(event.target.name, event.target.value)
  // }

  const handleBlur = (event) => {
    // console.log(event.target.name, event.target.value);
    // debugger;
    let isFieldValid = true;
    if(event.target.name == 'email') {
      // const isEmailValid = /\S+@\S+\.\S+/.test(event.target.value);
      // console.log(isEmailValid)
      isFieldValid = /\S+@\S+\.\S+/.test(event.target.value);
    }
    if(event.target.name == 'password'){
      const passwordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value)
      // console.log(passwordValid && passwordHasNumber)
      isFieldValid = passwordValid && passwordHasNumber
    }
    if(isFieldValid){
      // [...cart, newCart] (ema john simple example)
      const newUserInfo = {...user};
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo)
    }
  }
  const handleSubmit = (e) => {
    // console.log(user.email, user.password);
    if(newUser && user.email && user.password){
      // console.log('Submit');
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res => {
        // console.log(res);
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);

        updateUserName(user.name)
      })
      .catch((error) => {
        // var errorCode = error.code;
        // var errorMessage = error.message;
        // console.error(errorCode, errorMessage)

        const newUserInfo = {...user}
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      });
    }

    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = {...user};
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo)
          console.log('Sign in User SuccessFully', res.user);
        })
        .catch((error) => {
          const newUserInfo = {...user}
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    e.preventDefault();
  }

  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function() {
      console.log('Update User Name Succesfully')
    }).catch(function(error) {
      console.log(error)
    });
  }
  return (
    <div className="App">
        { user.isSignedIn ? <button onClick={handleSignOut} >Sign Out</button> :
          <button onClick={handleSignIn} >Sign In</button>
        }
        <br />
        <button onClick={handleFbSignIn}>Sign In Using Facebook</button>
        {
          user.isSignedIn && <div>
              <p>WelCome, {user.name}</p>
              <p>Email {user.email}</p>
              <img src={user.photo} alt="" ></img >
          </div>
        }
        <h1>Our Own Authentication</h1>
        {/* <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Password: {user.password}</p> */}

        <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
        <label htmlFor="newUser">New User Sign Up</label>

        <form onSubmit={handleSubmit}>
        {newUser && <input type="text" name="name" onBlur={handleBlur} placeholder="Enter Your Name"/>}
        <br />
          {/* <input type="text" name="email" onChange={handleChange} placeholder="Enter Email Address" required/> */}
          <input type="text" name="email" onBlur={handleBlur} placeholder="Enter Email Address" required/>
          <br />
          {/* <input type="password" name="password" onChange={handleChange} placeholder="Enter Password" required/> */}
          <input type="password" name="password" onBlur={handleBlur} placeholder="Enter Password" required/>
          <br />
          <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'} />
        </form>

        <p style={{color: 'red'}}>{user.error}</p>
        { user.success && <p style={{color: 'green'}}>User {newUser ? 'Create' : 'LogIn'} A Succesfully</p>}
    </div>
  );
}

export default App;
