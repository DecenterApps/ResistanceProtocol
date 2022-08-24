import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

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
    setNOISupplyHistory((state) => [...state, snapshot.val()]);
  });
}

const setUpRRTracking = async(setRedemptionRateHistory)=>{
  const rrRef = firebase.database().ref(`rates`);

  rrRef.on("child_added", (snapshot) => {
    setRedemptionRateHistory((state) => [...state, snapshot.val()]);
  });
}

const setUpRPTracking = async(setRedemptionPriceHistory)=>{
  const rpRef = firebase.database().ref(`redemptionPrices`);

  rpRef.on("child_added", (snapshot) => {
    setRedemptionPriceHistory((state) => [...state, snapshot.val()]);
  });
}

const setUpMPTracking = async(setMarketPriceHistory)=>{
  const marketRef = firebase.database().ref(`marketPrices`);

  marketRef.on("child_added", (snapshot) => {
    setMarketPriceHistory((state) => [...state, snapshot.val()]);
  });
}

const closeConnection=()=>{
  firebase.database().goOffline()
}

export default {setUpNOITracking,setUpMPTracking,setUpRPTracking,setUpRRTracking,closeConnection };
