import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import NewMessage from './NewMessage';
import CustomAvatar from '../components/CustomAvatar';
import { loadUser } from '../utils/dbUtils';
import DeleteIcon from '@material-ui/icons/Delete';
import FavoritIcon from '@material-ui/icons/Favorite';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Loader from '../components/Loader';

const useStyles = makeStyles((theme) => ({
  text: {
    padding: theme.spacing(2, 2, 0),
  },
  paper: {
    paddingBottom: 50,
    paddingTop: 15,
    height: '70vh',
  },
  list: {
    marginBottom: theme.spacing(3),
    maxHeight: '100%',
    overflow: 'auto',
  },

  listItem: {
    '&:hover $buttonDelete': {
      visibility: 'inherit',
    },
    '&:hover $buttonFavorite': {
      visibility: 'inherit',
    },
  },
  buttonDelete: { visibility: 'hidden' },
  buttonFavorite: { visibility: 'hidden' },
}));

const Chat = ({ history }) => {
  const classes = useStyles();
  const [messages, setMessages] = useState([]);
  const [us, setUs] = useState(null);

  const chatDomRef = useRef();

  const addMessage = (message) => {
    messages.push(message);
    setMessages([...messages.sort((a, b) => a.date - b.date)]);

    if (chatDomRef.current) {
      chatDomRef.current.scrollTop = chatDomRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const chatRef = firebase.database().ref('/chat');

    chatRef.on(
      'child_added',
      (snapshot) => {
        //  new message
        const messageItem = snapshot.val();
        // loadUser(messageItem.user).then((data) => {
        //   messageItem.user = data;
        //   addMessage(messageItem);
        //   console.log('cur-uid---', firebase.auth().currentUser.uid);
        // });
        firebase
          .database()
          .ref(`/users/${messageItem.user}`)
          .once('value')
          .then((userResp) => {
            messageItem.user = userResp.val();
            setUs(firebase.auth().currentUser.uid);
            console.log('messages---', firebase.auth().currentUser.uid);
            addMessage(messageItem);
          });
      },
      (error) => {
        console.log(error);
        if (error.message.includes('permission_denied')) {
          history.push('/login');
        }
      }
    );
  }, []);

  // const handleMouseOver = (event) => {
  //   console.log(JSON.parse(event.target.dataset.info));
  // };

  // console.log('messages---', messages);
  // console.log('cur-us---', firebase.auth().currentUser);
  // if (firebase.auth().currentUser) {
  //   const curUs = firebase.auth().currentUser.uid;
  //   console.log('cur-us---', curUs);
  // }

  return (
    <Container>
      <Paper square className={classes.paper}>
        <Typography className={classes.text} variant="h5" gutterBottom>
          Chat
        </Typography>
        {!us && <Loader />}
        <List className={classes.list} ref={chatDomRef}>
          {console.log(us)}
          {messages.map(({ date, user, message, id }) => (
            <ListItem
              button
              key={date}
              className={classes.listItem}
              data-info={JSON.stringify(id)}
              // onMouseOver={handleMouseOver}
            >
              <ListItemAvatar>
                <CustomAvatar name={user.name} avatar={user.avatar} size="md" />
                {/* <CustomAvatar name={user.name} avatar={user.avatar} size="md" /> */}
              </ListItemAvatar>
              <ListItemText
                primary={user ? user.name : 'anonymous'}
                secondary={message}
              />

              {us === id ? (
                <Tooltip title="Delete">
                  <IconButton
                    aria-label="delete"
                    className={classes.buttonDelete}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Favorite">
                  <IconButton
                    aria-label="favorite"
                    className={classes.buttonFavorite}
                  >
                    <FavoritIcon />
                  </IconButton>
                </Tooltip>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>
      <NewMessage />
    </Container>
  );
};

export default withRouter(Chat);
