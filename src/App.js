import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';

import Header from './components/layout/Header';
import User from './components/User';
import Routes from './Routes';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import { loadUser } from './utils/dbUtils';

const firebaseConfig = {
  apiKey: 'AIzaSyAc8rRwv_gUz8mXhSmYI5x8WlgCveDo3hM',
  authDomain: 'chat-react-9a725.firebaseapp.com',
  databaseURL: 'https://chat-react-9a725.firebaseio.com',
  projectId: 'chat-react-9a725',
  storageBucket: 'chat-react-9a725.appspot.com',
  messagingSenderId: '180298420289',
  appId: '1:180298420289:web:73549a94af6bd2306df6c0',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function App() {
  const [user, setUser] = useState(null);
  const onLogout = () => {
    setUser(null);
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged((response) => {
      if (response) {
        // loadUser(response.uid).then((data) => {
        //   setUser(data);
        // });
        firebase
          .database()
          .ref(`/users/${response.uid}`)
          .once('value')
          .then((snapshot) => {
            setUser(snapshot.val());
          });
      }
    });
  }, []);
  return (
    <Router>
      <CssBaseline />
      <Header>{user && <User user={user} onLogout={onLogout} />}</Header>
      <Routes />
    </Router>
  );
}

export default App;
