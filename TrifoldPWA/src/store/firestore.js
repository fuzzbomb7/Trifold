var firebaseConfig = {
	apiKey: "AIzaSyB8THBATXb92xKjGLPvCZhcnNPxpmQtN6w",
	authDomain: "trifold-data.firebaseapp.com",
	databaseURL: "https://trifold-data.firebaseio.com",
	projectId: "trifold-data",
	storageBucket: "trifold-data.appspot.com",
	messagingSenderId: "198680367639",
	appId: "1:198680367639:web:44bf7c5f2beaa78b518252"
};

import firebase from "firebase/app";
import "firebase/firestore";

// Get a Firestore instance
export const db = firebase.initializeApp(firebaseConfig).firestore();

// Export types that exists in Firestore
const { Timestamp, GeoPoint } = firebase.firestore;
export { Timestamp, GeoPoint };
