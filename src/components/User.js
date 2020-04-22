import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import Link from '@material-ui/core/Link';
// import { withRouter } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import CustomAvatar from './CustomAvatar';

const MyLink = React.forwardRef((props, ref) => (
  <RouterLink ref={ref} to="/getting-started/installation/" {...props} />
));

const User = ({ history, user, onLogout }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setAnchorEl(null);

    firebase
      .auth()
      .signOut()
      .then(() => {
        if (onLogout) onLogout();
        history.push('/login');
      });
  };

  return (
    <div>
      <IconButton
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <CustomAvatar name={user.name} avatar={user.avatar} size="sm" />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={handleClose}
      >
        <MenuItem disabled>{user.name}</MenuItem>
        <MenuItem>
          <Link
            to="/profile"
            component={MyLink}
            variant="body2"
            onClick={handleClose}
          >
            My profile
          </Link>
        </MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </div>
  );
};

export default withRouter(User);
