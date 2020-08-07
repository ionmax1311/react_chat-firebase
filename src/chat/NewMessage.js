import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import Icon from "@material-ui/core/Icon";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    paddingBottom: 20,
  },
  message: {
    padding: "0 20px",
    border: "1px solid #ccc",
    borderRadius: 8,
    justifyContent: "space-between",
    flexWrap: "nowrap",
  },
  box: {
    height: "100%",
    paddingLeft: 20,
  },
}));

const NewMessage = () => {
  const classes = useStyles();
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const { currentUser } = firebase.auth();
    // console.log('currentUser', currentUser);
    if (!currentUser) return;

    const newMessage = {
      user: currentUser.uid,
      message,
      // date: firebase.database.ServerValue.TIMESTAMP,
      date: Date.now(),
      id: currentUser.uid,
    };

    firebase
      .database()
      .ref("/chat")
      .push(newMessage)
      .then((res) => {
        setMessage("");
      })
      .catch((error) => {
        console.log(error);
        alert(error.message);
      });
  };

  return (
    <Paper square className={classes.paper}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={0} direction="row" className={classes.message}>
          <Grid item sx={10} xs={12}>
            <TextField
              margin="normal"
              name="message"
              required
              fullWidth
              id="message"
              label="message"
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Grid>
          <Grid item xs={2}>
            <Box display="flex" alignItems="center" className={classes.box}>
              <Button
                variant="contained"
                color="primary"
                endIcon={<Icon>send</Icon>}
                fullWidth
                disabled={!message.length}
                onClick={handleSubmit}
              >
                Send
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default NewMessage;
