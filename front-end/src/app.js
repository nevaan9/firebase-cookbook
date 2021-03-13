require("./js/main.js");
require("./scss/style.scss");
const firebase = require("firebase").default;

var firebaseConfig = require("./firebase-config.js");
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

// Uploading files to Firebase
const input = document.getElementById("file-input");
if (input) {
  const uploadToFirebase = () => {
    let file = input.files[0]; //Getting the file from the upload
    if (file) {
      //Getting the root ref from the Firebase Storage.
      let rootRef = firebase.storage().ref();
      // nameA/nameB/nameC created a folder like structure
      let fileRef = rootRef.child(`images/${file.name}`);
      fileRef
        .put(file)
        .then(() => {
          console.log("your images was uploaded !");
        })
        .catch((err) => console.log(err));
    }
  };
  input.addEventListener("change", uploadToFirebase);
}

// Downloading files from Firebase

// the filename and its extension need to be grabbed from a custom logic of your own.
// That is done by using a local database that holds a small metadata fingerprint of the file after you upload it.
// Later on, whenever you want to do any kind of custom logic, it will be with ease.

var rootRef = firebase.storage().ref();
var imageRef = rootRef.child("images/one.png");
imageRef
  .getDownloadURL()
  .then((url) => {
    const imageTag = document.getElementById("firebase-image");
    if (imageTag) {
      imageTag.src = url;
    }
    console.log("IMAGE URL TO FILE: ", url);
  })
  .catch((err) => console.log(err));

// Deleting a file
// just call imageRef.delete() ---> Returns a promise

// Getting file meta data
//No let's get the file metadata.
imageRef
  .getMetadata()
  .then((meta) => {
    //Meta function parameter represent our file metadata.
    console.log("META DATA", meta);
  })
  .catch((err) => console.log(err));

// Handling Errors
//   .catch(err => {
//     switch (err.code) {
//          case 'storage/unknown':
//          break;
//          case 'storage/object_not_found':
//          breaks;
//          case : 'storage/project_not_found':
//          breaks;
//          case : 'storage/unauthenticated':
//          breaks;
//          case : 'storage/unauthorized':
//          breaks;
//          ..
//          ...
//          ....
//     }
// });

// ================== CHAPTER 4: AUTHENTICATION ===========================================

// Went to firebase authintication console --> enabled auth --> selected email, p --> added a user

// SIGN IN - this would be inside an event listener after a user has submitted their username / p
const email = "nevaan9@gmail.com";
const p = "helloworld123"; // dummy
firebase
  .auth()
  .signInWithEmailAndPassword(email, p)
  .then((user) => {
    console.log("USER: ", user);
  })
  .catch(function (error) {
    console.error("ERROR GETTING USER", error);
  });

// SIGN OUT
setTimeout(() => {
  console.log("Logging out!");
  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log("Success Logout!");
    })
    .catch((e) => {
      console.error("Error Logout!", e);
    });
}, 7000);

// ------- Anonymous Auth ----------
// firebase
//   .auth()
//   .signInAnonymously()
//   .catch((err) => {});

// Event listener for auth stuff
firebase.auth().onAuthStateChanged((user) => {
  // check the user object to see if signed in or out
  console.log(user);
});

// Logging in with 3rd party providers (most providers are the same logic)
// Google
// MAKE SURE YOU ADD GOOGLE AS AN ALLOWED AUTH IN FIREBASE

let googleLogin = document.getElementById("googleLogin");
if (googleLogin) {
  googleLogin.addEventListener("click", () => {
    //1. Get a GoogleAuthProvider instance.
    var googleProvider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(googleProvider)
      .then(function (result) {
        console.log("GOOGLE AUTH RESULT: ", result);
        var user = result.user;
        console.log("GOOGLE AUTH USER: ", user);
      })
      .catch(function (error) {
        //TODO: Handle Errors here.
        console.log("Google auth error: ", error);
      });
  });
}

// Implementing user meta retrieval
let currentUserInfo = document.getElementById("currentUserInfo");
if (currentUserInfo) {
  currentUserInfo.addEventListener("click", () => {
    var user = firebase.auth().currentUser;
    var currentUser = null;
    if (user != null) {
      var currentUser = {};
      currentUser.name = user.displayName;
      currentUser.email = user.email;
      currentUser.photoUrl = user.photoURL;
      currentUser.emailVerified = user.emailVerified;
      currentUser.uid = user.uid;
    }
    console.log("CURRENT USER INFO", currentUser);
  });
}

// ---------- We also can LINK ACCOUND TOGETHER ----------------------------
// This is important so the same uuid is used across there multiple accounts

// let facebookProvider = new firebase.auth.FacebookAuthProvider();
// let twitterProvider = new firebase.auth.TwitterAuthProvider();
// let googleProvider = new firebase.auth.GoogleAuthProvider();

// auth.currentUser.linkWithPopup(facebookProvider).then(function(result) {
//   // handle success res
// }).catch(function(error) {
//   // handle error res
// });

// ================================= CHAPTER 5. SECURING APPLICATION FLOW WITH FIREBASE RULES (AUTHORIZATION) ================================

// Firebase used the BOLT Language for this
// Need to install the bolt language -- npm i firebase-bolt
// Can compile any file that has the .bolt ext using `firebase-bolt <filename>.bolt` in the terminal --> this will generate a .json file

// We can secure all firebase services (database, storage, messaging etc)

// 1.
// ----- Securing data base using bolt (example) -----
// path /articles/{uid}/drafts {
//   /create {
//     create() {
//       isCreator(uid)
//     }
//   }

//   /publish {
//     update() {
//       isCreator(uid)
//     }
//   }

//   /delete {
//     delete() {
//       isCreator(uid)
//     }
//   }
// }

// isCreator(uid) {
//   uid == auth.uid
// }

// We're setting a new path for our Articles awesome website in the drafts section for a specific user, represented in the uid dynamically changed value.
// Under that specific path or route, we're securing the sub-routes and check the create, public, and delete routes by checking that the currently authenticated user uid is the same as the one who is to manipulate that data within our database.
// We're setting the isCreator function with uid as a parameter for privileges checking.

// 2.
// ----- securing storage (example) ------
// ----- Add the following in the storage rules section -----
// service firebase.storage {
//   match /b/{bucket}/o {
//     match /catgifs {
//       match /{allGifs=**} {
//         allow read;
//       }
//       match /secret/superfunny/{imageId} {
//         allow read, write:if request.auth !=null;
//       }
//     }
//   }
// }

// service firebase.storage: This line is essential; we're simply telling Firebase about the service we're trying to secure, in our case it will be the Firebase/storage service.

// match /b/{bucket}/o: This rule combines another powerful system, we're speaking mainly about the matching system, the Storage Rules uses this keyword to filter through files path, and what Firebase calls wildcards path also the match system supports nested matching, which is exactly what we're using in this example. Another interesting point is the matching against in this line: /b/{bucket}/o, this is simply another match we're evaluating to make sure that we're securing files within the Cloud Storage bucket.

// We previously spoke about the wildcards paths. They are simply a matching pattern, so let's decompose it. The path we're matching against in this case will be the following: "/catgifs/**" which means for every single path variation within it we're using another rule, speaking of allow which will simply allow whether read or write operations or both.
// Over the last match we had, we're making sure that no user will have the writing privileges except the authenticated one, in this case, where we will be using the wildcard--A simple matcher that represent each element id within that resource--represented in {imageId} and allowing both read and write in case the sent request holds an auth property within, besides those objects are global so you don't need to define them.

// 2.1
// ------ Securing contnet based on userId (example) -----
// match /secured/personal/{userId}/images/{imageId} {
//   allow read:if request.auth.uid == userId;
// }

// match /secured/personal/{userId}/books/{bookId} {
//   allow read:if request.auth.uid == userId;
// }

// match /secured/personal/{userId}/images/{imageId} {
//   allow write:if request.auth.uid == userId && request.resource.size < 15*1024*1024 && request.resource.contentType.matches('image/.*');
// }

// match /secured/personal/{userId}/books/{bookId} {
//   allow write:if request.auth.uid == userId && request.resource.size < 100*1024*1024 && request.resource.contentType.matches('application/pdf');
// }

// We're trying to protect user-related media, so to do that we've created a new route with two dynamic parameters: the usersId for authentication management, and image id as well. In the first two match we're using the allow rule so we can simply allow the reading of our images and book in case we're authenticated and the request uid matched the one from the user asking for them.
// In the second two-match we're doing some content type management, so if we're securing the images, we need to make sure that images inside that section of the bucket are in fact images and the same thing with books. We're also making some size management, and checking if the image or the book won't exceed the allowed files predefined size.
