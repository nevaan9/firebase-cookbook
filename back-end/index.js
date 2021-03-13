const express = require("express");
const app = express();
// Parse incomming POST request body objects
app.use(express.json());
const port = 3000;
//  Firebase stuff
var admin = require("firebase-admin");

var serviceAccount = require("./configs/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-cookbook-f4977-default-rtdb.firebaseio.com",
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Get user by email
app.get("/users/search/email", (req, res) => {
  let email = req.query.email;
  admin
    .auth()
    .getUserByEmail(email)
    .then((users) => {
      res.json({ users });
    })
    .catch((err) => {
      console.log(
        `[*] Huston we've an error: Error over getting users by email, with error: ${err}`
      );
      res.json({
        message: `External Error: getting user by email, error : ${err}`,
      });
    });
});

// GET user by phone
app.get("/users/search/phone", (req, res) => {
  let phoneNumber = req.query.phone;
  admin
    .auth()
    .getUserByPhoneNumber(phoneNumber)
    .then((users) => {
      res.json({ users });
    })
    .catch((err) => {
      console.log(
        `[*] Huston we've an error: Error over getting users by phone number, with error: ${err}`
      );
      res.json({
        message: `External Error: getting user by phone number, error : ${err}`,
      });
    });
});

// Create a user
app.post("/create/user", (req, res) => {
  console.log(req.body);
  let { email, password, fullName } = req.body;
  admin
    .auth()
    .createUser({
      email: email,
      password: password, //Must be at least six characters long
      displayName: fullName,
    })
    .then((user) => {
      res.json({ user });
    })
    .catch((err) => {
      console.log(
        `External Error: While creating new account, with error : ${err}`
      );
      res.json({
        message: `Error: while creating new account, with error: ${err}`,
      });
    });
});

// Checkout all the USER MANAGEMENT fuctions you can call here: https://firebase.google.com/docs/auth/admin/manage-users
// delete user, list users,

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
