import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API,
    authDomain: "resistanceprotocol.firebaseapp.com",
    databaseURL: "https://resistanceprotocol-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "resistanceprotocol",
    storageBucket: "resistanceprotocol.appspot.com",
    messagingSenderId: "384010337601",
    appId: "1:384010337601:web:ab300045fe9139d28cb5c0"
}

const app = firebase.initializeApp(firebaseConfig);

const setUpCDPs = async (setCDPs,address) => {
    const cdpsRef = firebase.database().ref(`cdps/${address}`);
  
    cdpsRef.on("value", (snapshot) => {
        console.log(snapshot.val())
      //let playersTemp = snapshot.val() || {};
      /*Object.keys(playersTemp).forEach((key) => {
        if (key === config.playerId) return;
        players[key] = playersTemp[key];
      });*/
    });
  
    cdpsRef.on("child_added", (snapshot) => {
      console.log(snapshot.val())
      setCDPs(state => [...state, snapshot.val()])
    });
  
    cdpsRef.on("child_removed", (snapshot) => {
      const removedCdp = snapshot.val();
      setCDPs(state => state.filter(c=>c.cdpId!==removedCdp.cdpId))
    });
  };

  export default {setUpCDPs}