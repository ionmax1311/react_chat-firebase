import React, { useState, useEffect, useRef } from "react";
import { withRouter } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";

import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";
import NewMessage from "./NewMessage";
import CustomAvatar from "../components/CustomAvatar";

import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import FavoritIcon from "@material-ui/icons/Favorite";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Loader from "../components/Loader";
import { Divider } from "@material-ui/core";

// const DialogContent = withStyles((theme) => ({
//   root: {
//     padding: theme.spacing(2),
//   },
// }))(MuiDialogContent);

// const DialogActions = withStyles((theme) => ({
//   root: {
//     margin: 0,
//     padding: theme.spacing(1),
//   },
// }))(MuiDialogActions);

const useStyles = makeStyles((theme) => ({
  text: {
    padding: theme.spacing(2, 2, 0),
  },
  paper: {
    paddingBottom: 50,
    paddingTop: 15,
    height: "70vh",
  },
  list: {
    marginBottom: theme.spacing(3),
    maxHeight: "100%",
    overflow: "auto",
  },

  listItem: {
    "&:hover $buttonDelete": {
      visibility: "inherit",
    },
    "&:hover $buttonEdit": {
      visibility: "inherit",
    },
    "&:hover $buttonFavorite": {
      visibility: "inherit",
    },
  },
  buttonDelete: { visibility: "hidden" },
  buttonEdit: { visibility: "hidden" },
  buttonFavorite: { visibility: "hidden" },
}));

const Chat = ({ history }) => {
  const [open, setOpen] = React.useState(false);

  let [curDate, setCurDate] = React.useState();

  let [editMessage, setEditMessage] = useState("");

  const classes = useStyles();
  let [messages, setMessages] = useState([]);
  const [us, setUs] = useState(null);
  const [changeMessage, setChangeMessage] = React.useState(editMessage);
  const chatDomRef = useRef();

  const addMessage = (message) => {
    messages.push(message);

    setMessages([
      ...messages
        .filter((e) => e.message.date !== message.date)
        .sort((a, b) => a.date - b.date),
    ]);

    if (chatDomRef.current) {
      chatDomRef.current.scrollTop = chatDomRef.current.scrollHeight;
    }
  };

  const handleChange = (event) => {
    setChangeMessage(event.target.value);
    // console.log(event.target.value);
  };

  const sendEditMessage = (date, userId) => {
    let ref = firebase.database().ref("chat");

    ref
      .orderByChild("date")
      .equalTo(curDate)

      .on("value", (snapshot) => {
        snapshot.forEach((child) => {
          let a = firebase.database().ref(`/chat/${child.key}`).key;

          firebase
            .database()
            .ref(`chat/${a}`)
            .update({ message: changeMessage });

          console.log("1", messages);
        });
      });

    console.log("3", messages);

    setOpen(false);

    console.log("final-edit-message", changeMessage);
  };

  const handleEdit = (date, message) => {
    setOpen(true);

    let ref = firebase.database().ref("chat");

    ref
      .orderByChild("date")
      .equalTo(date)
      .on("value", (snapshot) => {
        snapshot.forEach((child) => {
          console.log("snapshot-val", snapshot.val());
          console.log(
            "child.key",
            firebase.database().ref(`/chat/${child.key}`)
          );
          setEditMessage(message);

          // console.log("edit-message", editMessage);
          // console.log(date);
          setCurDate(date);
        });
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRemove = (date) => {
    let ref = firebase.database().ref("chat");

    ref
      .orderByChild("date")
      .equalTo(date)
      .on("value", (snapshot) => {
        snapshot.forEach((child) => {
          firebase.database().ref(`/chat/${child.key}`).remove();
          // console.log("child---", child);
        });
      });
  };

  useEffect(() => {
    // setMessages(messages);
    const chatRef = firebase.database().ref("/chat");

    chatRef.on(
      "child_added",
      (snapshot) => {
        //  new message
        const messageItem = snapshot.val();

        firebase
          .database()
          .ref(`/users/${messageItem.user}`)
          .once("value")
          .then((userResp) => {
            messageItem.user = userResp.val();
            setUs(firebase.auth().currentUser.uid);
            console.log("messageitem", messageItem);
            // console.log("messageitem-messagwe", messageItem.message);
            addMessage(messageItem);
          });
      },
      (error) => {
        console.log(error);
        if (error.message.includes("permission_denied")) {
          history.push("/login");
        }
      }
    );
    chatRef.on(
      "child_removed",
      (snapshot) => {
        const messageItem = snapshot.val();

        messages = messages
          .filter((e) => e.date !== messageItem.date)
          .sort((a, b) => a.date - b.date);

        setMessages(messages);
        console.log(messages);
      },
      (error) => {
        console.log(error);
        if (error.message.includes("permission_denied")) {
          history.push("/login");
        }
      }
    );
    chatRef.on(
      "child_changed",
      (snapshot) => {
        const messageItem = snapshot.val();

        firebase
          .database()
          .ref(`/users/${messageItem.user}`)
          .once("value")
          .then((userResp) => {
            messageItem.user = userResp.val();
            setUs(firebase.auth().currentUser.uid);
            console.log("messageitem", messageItem);
            // console.log("messageitem-messagwe", messageItem.message);
            addMessage(messageItem);
          });

        messages = messages
          .filter((e) => e.date !== messageItem.date)
          .sort((a, b) => a.date - b.date);

        // console.log(snapshot.val().message);
        console.log("child_changed-messages", messages);
      },
      (error) => {
        console.log(error);
        if (error.message.includes("permission_denied")) {
          history.push("/login");
        }
      }
    );
  }, []);

  return (
    <Container>
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="edit message"
              type="text"
              fullWidth
              defaultValue={editMessage}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                sendEditMessage();
              }}
              color="primary"
            >
              Send
            </Button>
          </DialogActions>
        </Dialog>
      </div>
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
                primary={user ? user.name : "anonymous"}
                secondary={message}
              />
              {/* {console.log(key)} */}
              {us === id ? (
                <div>
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
                  <Tooltip title="Edit">
                    <IconButton
                      aria-label="edit"
                      className={classes.buttonEdit}
                      onClick={() => {
                        handleEdit(date, message);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              ) : // <Tooltip title="Favorite">
              //   <IconButton
              //     aria-label="favorite"
              //     className={classes.buttonFavorite}
              //   >
              //     <FavoritIcon />
              //   </IconButton>
              // </Tooltip>
              null}
            </ListItem>
          ))}
        </List>
      </Paper>
      <NewMessage />
    </Container>
  );
};

export default withRouter(Chat);
