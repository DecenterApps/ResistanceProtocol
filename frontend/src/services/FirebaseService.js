import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import { getDatabase, ref, child, get } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API,
  authDomain: "resistanceprotocol.firebaseapp.com",
  databaseURL:
    "https://resistanceprotocol-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "resistanceprotocol",
  storageBucket: "resistanceprotocol.appspot.com",
  messagingSenderId: "384010337601",
  appId: "1:384010337601:web:ab300045fe9139d28cb5c0",
};

const app = firebase.initializeApp(firebaseConfig);

const setUpCDPs = async (setCDPs, address, cdps) => {
  const cdpsRef = firebase.database().ref(`cdps/${address}`);

  cdpsRef.on("value", (snapshot) => {
    console.log(snapshot.val());
    let cdps = snapshot.val() || {};
    console.log(cdps);
    let newCdps = [];
    Object.keys(cdps).forEach((key) => {
      newCdps.push(cdps[key]);
    });
    setCDPs(newCdps);
  });

  cdpsRef.on("child_added", (snapshot) => {
    console.log(snapshot.val());
    if (cdps.filter((cdp) => cdp.cdpId === snapshot.val().cdpId).length === 0)
      setCDPs((state) => [...state, snapshot.val()]);
  });

  cdpsRef.on("child_removed", (snapshot) => {
    const removedCdp = snapshot.val();
    setCDPs((state) => state.filter((c) => c.cdpId !== removedCdp.cdpId));
  });
};

const loadCDPs = async (setCDPs, address) => {
  const cdpsRef = firebase.database().ref(`cdps/${address}`);
  cdpsRef
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export default { setUpCDPs, loadCDPs };
