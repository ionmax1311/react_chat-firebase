import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import NewMessage from './NewMessage';
import CustomAvatar from '../components/CustomAvatar';

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
  let [messages, setMessages] = useState([]);
  const [us, setUs] = useState(null);

  const chatDomRef = useRef();

  const addMessage = (message, date) => {
    console.log('messages-add', messages);
    console.log(
      'messages-add111',
      messages.filter((e) => e.message.date !== message.date)
    );
    console.log('message-add', message);
    console.log('message-add22', message.date);
    // debugger;
    messages.push(message);

    // setMessages([...messages.sort((a, b) => a.date - b.date)]);
    setMessages([
      ...messages
        .filter((e) => e.message.date !== message.date)
        .sort((a, b) => a.date - b.date),
    ]);

    if (chatDomRef.current) {
      chatDomRef.current.scrollTop = chatDomRef.current.scrollHeight;
    }
  };

  const handleRemove = (date) => {
    // debugger;

    console.log('1', date);
    let ref = firebase.database().ref('chat');

    ref
      .orderByChild('date')
      .equalTo(date)
      .on('value', (snapshot) => {
        snapshot.forEach((child) => {
          // console.log(child.key);
          // console.log(date);
          console.log(child.val());
          firebase.database().ref(`/chat/${child.key}`).remove();
          console.log('messages-del--111', messages);

          // messages = messages.splice(1, 2);

          // setMessages(messages);

          setMessages(messages.filter((e) => e.date !== date));
          // setMessages(messages);
          console.log(
            'messages-del---222',
            messages.filter((e) => e.date !== date)
          );

          ////////////
        });
      });

    alert('done');
  };

  console.log('messages', messages);

  useEffect(() => {
    // setMessages(messages);
    const chatRef = firebase.database().ref('/chat');

    chatRef.on(
      'child_added',
      (snapshot) => {
        //  new message
        const messageItem = snapshot.val();

        firebase
          .database()
          .ref(`/users/${messageItem.user}`)
          .once('value')
          .then((userResp) => {
            messageItem.user = userResp.val();
            setUs(firebase.auth().currentUser.uid);
            console.log('messageItem', messageItem);
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

  return (
    <Container>
      <Paper square className={classes.paper}>
        <Typography className={classes.text} variant="h5" gutterBottom>
          Chat
        </Typography>
        {!us && <Loader />}
        <List className={classes.list} ref={chatDomRef}>
          {messages.map(({ date, user, message, id }) => (
            <ListItem button key={date} className={classes.listItem}>
              <ListItemAvatar>
                <CustomAvatar name={user.name} avatar={user.avatar} size="md" />
              </ListItemAvatar>
              <ListItemText
                primary={user ? user.name : 'anonymous'}
                secondary={message}
              />
              {/* {console.log(key)} */}
              {us === id ? (
                <Tooltip title="Delete">
                  <IconButton
                    aria-label="delete"
                    className={classes.buttonDelete}
                    onClick={() => {
                      handleRemove(date);
                    }}
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
