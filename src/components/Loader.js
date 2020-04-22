import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(2),
      //   position: 'absolute',
      //   left: '50%',
      //   top: '50%',
    },
  },
}));

const Loader = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CircularProgress />
      {/* <CircularProgress color="secondary" /> */}
    </div>
  );
};

export default Loader;
