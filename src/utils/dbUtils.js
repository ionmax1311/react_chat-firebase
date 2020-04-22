import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';

export const loadUser = (uid) => {
  return new Promise((resolve, reject) => {
    firebase
      .database()
      .ref(`/users/${uid}`)
      .once('value')
      .then((snapshot) => {
        const userData = snapshot.val();
        // console.log('userData', firebase.database().ref(`/users/${uid}`).key);
        if (userData.avatar) {
          //download avatar
          // console.log('userData.avatar', userData);
          firebase
            .storage()
            .ref()
            .child(`/avatars/${userData.avatar}`)
            .getDownloadURL()
            .then(
              (url) => {
                userData.avatar = url;
                resolve(userData);
              },
              (error) => {
                resolve(userData);
              }
            );
        } else {
          resolve(userData);
        }
      })
      .catch((error) => {
        reject(new Error('error user data'));
      });
  });
};
