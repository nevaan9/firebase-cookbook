require("./js/main.js");
require("./scss/style.scss");
const firebase = require("firebase").default;

var firebaseConfig = {
  apiKey: "AIzaSyAEv4GrS-zcytyLISVLsOOr_7N0mPL6EyA",
  authDomain: "fir-cookbook-f4977.firebaseapp.com",
  projectId: "fir-cookbook-f4977",
  storageBucket: "fir-cookbook-f4977.appspot.com",
  messagingSenderId: "1046892363503",
  appId: "1:1046892363503:web:a3bcbabc57b47efa10651a",
  measurementId: "G-NHL1R8Z7Y0",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// initialize a db
const db = firebase.database();

// ================== CHAPTER 2: REAL TIME DATABASE ===========================================

// push some data to the DB
// in firebase a/b will create a folder like structure
db.ref("packtpub/tweets").set({
  name: "Nevaan Perera",
  text: "Hello, I am learning firebase!",
  date: Date.now(),
});

// push lets create a new instance of data we are pushing (so the object pushed will have a UUID every time it gets inserted)
// ------------------------------
// db.ref("packtpub/chat").push({
//   name: "Nevaan Perera!",
//   message: "Hello All !",
//   photo_url: "gefgewouhfoewuewbchoiewce",
// });

// We just wanna get the data once (no real time capabilities)
firebase
  .database()
  .ref("/packtpub/tweets")
  .once("value")
  .then((snapshot) => {
    console.log("ONCE SNAPSHOT", snapshot);
  });

// We want to keep an eye on data that is constantly changing
var adminRef = firebase.database().ref("/packtpub/tweets");
adminRef.on("value", (snapshot) => {
  console.log("REALTIME SNAPSHOT", snapshot);
});

// Can we add a reference to something that is not in the DB, but could be added later? -- lets try
// ------------- YES, THIS ACTUALLY WORKS ------------------
var packtpubRef1 = firebase.database().ref("packtpub");
const notthere = packtpubRef1.child("notthere");
notthere.on("value", (snapshot) => {
  console.log("REALTIME NOT THERE", snapshot);
});

// Referencing children using the .child() --> same as providing a relative path to .ref() ex: 'packtpub/tweets'
var packtpubRef2 = firebase.database().ref("packtpub");
var childRef = packtpubRef2.child("tweets");
console.log("Child Ref", childRef);

// The update() function will give us the option to send simultaneous update calls to our database, and won't do anything besides the expected behavior of an update function, that is, updating the data without altering the reference of the record.
// The set() function, within its behavior, changes the reference to the data itself while replacing it with a new one.
setTimeout(() => {
  const tweet = {
    text: "updating the text mates",
    date: Date(),
  };
  firebase.database().ref("/packtpub/tweets").update(tweet);
}, 5000);

// Check if we are connected to firebase
let miConnected = firebase.database().ref(".info/connected");
miConnected.on("value", function (res) {
  if (res.val() === true) {
    console.log("I AM CONNECTED!");
  } else {
    console.log("I AM DIS-CONNECTED!");
  }
});

// ================== CHAPTER 3: FILE MANAGEMENT ===========================================
