import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import config from '../config/config.json'


const app = firebase.initializeApp({apiKey:  process.env.REACT_APP_FIREBASE_API,...config.firebaseConfig});

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
