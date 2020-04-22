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
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

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
  },
  buttonDelete: { visibility: 'hidden' },
}));

const Chat = ({ history }) => {
  const classes = useStyles();
  const [messages, setMessages] = useState([]);

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

  console.log('messages---', messages);

  return (
    <Container>
      <Paper square className={classes.paper}>
        <Typography className={classes.text} variant="h5" gutterBottom>
          Chat
        </Typography>
        <List className={classes.list} ref={chatDomRef}>
          {messages.map(({ date, user, message }) => (
            <ListItem button key={date} className={classes.listItem}>
              <ListItemAvatar>
                <CustomAvatar name={user.name} avatar={user.avatar} size="md" />
                {/* <CustomAvatar name={user.name} avatar={user.avatar} size="md" /> */}
              </ListItemAvatar>
              <ListItemText
                primary={user ? user.name : 'anonymous'}
                secondary={message}
              />
              {/* <ListItemSecondaryAction
                className={classes.listItemSecondaryAction}
              > */}
              <Tooltip title="Delete">
                <IconButton
                  aria-label="delete"
                  className={classes.buttonDelete}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              {/* </ListItemSecondaryAction> */}
            </ListItem>
          ))}
        </List>
      </Paper>
      <NewMessage />
    </Container>
  );
};

export default withRouter(Chat);
