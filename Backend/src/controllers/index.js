import { db, auth, firebase } from "../config/config";

export const register = async (req, res) => {
  const { name, lastname, run, email, birth, password, isPassenger, isDriver } =
    req.body;
  if (
    name &&
    lastname &&
    run &&
    email &&
    birth &&
    password &&
    isPassenger &&
    isDriver
  ) {
    try {
      const fireRes = await auth.createUser({
        email: email,
        emailVerified: false,
        password: password,
        disabled: false,
      });
      const uid = fireRes.toJSON().uid;

      try {
        const docRef = db.collection("users").doc(uid);
        const firestoreRes = await docRef.set({
          email: email,
          name: name,
          apellido: lastname,
          run: run,
          birth: birth,
          isPassenger: isPassenger,
          isDriver: isDriver,
          DriverData: {},
        });
        res.json({ message: "Successful Registration" });
      } catch (e) {
        auth.deleteUser(uid).then(() => {
          console.log('"Failed save in Firestore auth user removed');
        })
        .catch((error) => {
          console.log('Error deleting user:', error);
        });
      }
    } catch (e) {
      //console.log(e);
      res.status(500).json(e);
    }
  } else {
    const msg = "Failed registration";
    res.status(400).json({ message: msg });
  }
};

