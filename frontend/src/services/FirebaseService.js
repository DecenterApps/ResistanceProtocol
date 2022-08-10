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

const setUpNOITracking = async(setNOISupplyHistory)=>{
  const noiRef = firebase.database().ref(`noiSupply`);

  noiRef.on("child_added", (snapshot) => {
    console.log(snapshot.val());
    setNOISupplyHistory((state) => [...state, snapshot.val()]);
  });
}

const setUpRRTracking = async(setRedemptionRateHistory)=>{
  const rrRef = firebase.database().ref(`rates`);

  rrRef.on("child_added", (snapshot) => {
    console.log(snapshot.val());
    setRedemptionRateHistory((state) => [...state, snapshot.val()]);
  });
}

const setUpRPTracking = async(setRedemptionPriceHistory)=>{
  const rpRef = firebase.database().ref(`redemptionPrices`);

  rpRef.on("child_added", (snapshot) => {
    console.log(snapshot.val());
    setRedemptionPriceHistory((state) => [...state, snapshot.val()]);
  });
}

const setUpMPTracking = async(setMarketPriceHistory)=>{
  const marketRef = firebase.database().ref(`marketPrices`);

  marketRef.on("child_added", (snapshot) => {
    console.log(snapshot.val());
    setMarketPriceHistory((state) => [...state, snapshot.val()]);
  });
}

const setUpCDPs = async (cdpsOrigin, setCDPs, address) => {
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
    if (cdpsOrigin)
      if (
        cdpsOrigin.filter((cdp) => cdp.cdpId === snapshot.val().cdpId)
          .length === 0
      ) {
        setCDPs((state) => [...state, snapshot.val()]);
      } else {
        setCDPs((state) => [...state, snapshot.val()]);
      }
  });

  cdpsRef.on("child_removed", (snapshot) => {
    const removedCdp = snapshot.val();
    setCDPs((state) => state.filter((c) => c.cdpId !== removedCdp.cdpId));
  });
};

const loadCDPs = async (setCDPs, address) => {
  const cdpsRef = firebase.database().ref(`cdps/${address}`);
  await cdpsRef
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        let newCdps = [];
        Object.keys(snapshot.val()).forEach((key) => {
          newCdps.push(snapshot.val()[key]);
        });
        setCDPs(newCdps);
        return newCdps;
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export default { setUpCDPs, loadCDPs,setUpNOITracking,setUpMPTracking,setUpRPTracking,setUpRRTracking };
