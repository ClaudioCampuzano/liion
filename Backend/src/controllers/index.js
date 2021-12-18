import { db, auth, FieldValue } from "../config/config";
import { isEmail, isLength, isDate, isAlphanumeric, isEmpty } from "validator";
import { validateRun } from "../middleware/validations";
import moment from "moment";

export const register = async (req, res) => {
  const {
    name,
    lastname,
    run,
    email,
    birth,
    password,
    gender,
    isDriver,
    photo,
  } = req.body;

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  if (
    !isEmpty(name) &&
    !isEmpty(lastname) &&
    !isEmpty(gender) &&
    validateRun(run) &&
    isEmail(email) &&
    isDate(birth) &&
    isLength(password, { min: 8 }) &&
    passwordRegex.test(password) &&
    !isDriver &&
    !isEmpty(photo)
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
          gender: gender,
          isDriver: isDriver,
          driverData: {},
          sRating: 0,
          nRating: 0,
          photo: photo,
        });
        res.json({ message: "Successful Registration" });
      } catch (e) {
        auth
          .deleteUser(uid)
          .then(() => {
            console.log('"Failed save in Firestore auth user removed');
          })
          .catch((error) => {
            console.log("Error deleting user:", error);
          });
      }
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    const msg = "Failed registration";
    res.status(400).json({ message: msg });
  }
};

export const getUserData = async (req, res) => {
  let uid = req.body.uid;

  if (uid) {
    try {
      const q = await db.collection("users").doc(uid).get();
      const docExist = q.exists;
      if (docExist) {
        res.send(q.data());
      } else {
        res.status(404).send("User not found");
      }
    } catch (e) {
      console.log(e);
      res.status(403).send("Token UID Inválido");
    }
  } else {
    res.status(403).send("Token UID Inválido");
  }
};

export const updateUserDriverStatus = async (req, res) => {
  const { uid, flagDriver, driverData } = req.body;

  if (uid && flagDriver) {
    try {
      const q = await db
        .collection("users")
        .doc(uid)
        .update("isDriver", flagDriver, "driverData", driverData);
      //console.log(q)
      res.send("Actualización de Driver Status exitoso");
    } catch (e) {
      console.log(e);
      res.status(403).send("Token UID Inválido");
    }
  } else {
    res.status(403).send("Token UID Inválido o flagDriver inválido");
  }
};
export const updateDriverRating = async (req, res) => {
  let uid = req.body.uid;
  let rating = req.body.rating;
  if (uid && rating) {
    try {
      // db.FieldValue.increment(50)
      const q = await db
        .collection("users")
        .doc(uid)
        .update({
          "driverData.sRating": FieldValue.increment(rating),
          "driverData.nRating": FieldValue.increment(1),
        });

      //console.log(q)
      res.send("Puntuación de conductor exitosa");
    } catch (e) {
      console.log(e);
      res.status(403).send("Token UID Inválido");
    }
  } else {
    res.status(403).send("Token UID Inválido o Llamada inválida");
  }
};

export const updateUserRating = async (req, res) => {
  let uid = req.body.uid;
  let rating = req.body.rating;
  if (uid && rating) {
    try {
      // db.FieldValue.increment(50)
      const q = await db
        .collection("users")
        .doc(uid)
        .update({
          sRating: FieldValue.increment(rating),
          nRating: FieldValue.increment(1),
        });

      //console.log(q)
      res.send("Puntuación de pasajero exitosa");
    } catch (e) {
      console.log(e);
      res.status(403).send("Token UID Inválido");
    }
  } else {
    res.status(403).send("Token UID Inválido o Llamada inválida");
  }
};

export const createTravel = async (req, res) => {
  const travelsTimes = [];
  var usefullTravelData = req.body;
  delete usefullTravelData.atoken;
  /* const usefullTravelData = (({ driverData, travelData, driverUID }) => ({
    driverUID,
    driverData,
    travelData,
  }))(req.body);*/
  try {
    const docRef = db.collection("travels");
    const traveldoc = await docRef
      .where("driverUID", "==", usefullTravelData.driverUID)
      .get();
    traveldoc.forEach((x) => {
      //travelsTimes.push([x.data().travelData.date, x.data().travelData.time, x.data().travelData.duration])
      travelsTimes.push([
        moment(x.data().date + " " + x.data().startTime, "DD/MM/YYYY HH:mm"),
        x.data().durationMinutes,
      ]);
    });
    let problems = false;
    let currentTimeTravelObject = moment(
      usefullTravelData.date + " " + usefullTravelData.startTime,
      "DD/MM/YYYY HH:mm"
    );

    let nextTimeTravelObject = currentTimeTravelObject.clone();
    nextTimeTravelObject.add(usefullTravelData.durationMinutes, "minutes");
    travelsTimes.forEach((x) => {
      let momentObej1 = x[0].clone();
      momentObej1.add(x[1], "minutes");
      if (
        currentTimeTravelObject.isBetween(x[0], momentObej1) ||
        nextTimeTravelObject.isBetween(x[0], momentObej1) ||
        currentTimeTravelObject.isSame(x[0])
      )
        problems = true;
    });

    if (problems)
      res.status(403).send("Ya tienes un viaje en ese rango de tiempo");
    else {
      const firestoreRes = await docRef.add(usefullTravelData);
      res.send("Viaje Creado exitosamente");
    }
  } catch (e) {
    console.log(e);
    res.status(403).send("Error");
  }
};

export const getTravels = async (req, res) => {
  const resultDataHard = [];
  const searchParams = JSON.parse(req.query["0"]);
  try {
    var men, woman, allGender;
    switch (searchParams.genderApplicant) {
      case "Otro":
        men = false;
        woman = false;
        allGender = true;
        break;
      case "Mujer":
        men = false;
        woman = true;
        allGender = true;
        break;
      case "Hombre":
        men = true;
        woman = false;
        allGender = true;
        break;
      default:
        men = true;
        woman = true;
        allGender = true;
    }
    const docRef = db.collection("travels");
    const snapshot = await docRef
      .where("nSeatsAvailable", ">", 0)
      .where("date", "==", searchParams.date)
      .where("localityDestination", "==", searchParams.localityDestination)
      .where("localityOrigin", "==", searchParams.localityOrigin)
      .where("status", "==", "open")
      .where("onlyMen", "==", men)
      .where("onlyWoman", "==", woman)
      .where("allGender", "==", allGender)
      .get();

    if (!snapshot.empty)
      for (const doc of snapshot.docs) {
        var driverRef = await db
          .collection("users")
          .doc(doc.data().driverUID)
          .get();

        driverRef.exists &&
          doc.data().driverUID != searchParams.uid &&
          resultDataHard.push({
            id: doc.id,
            costPerSeat: doc.data().costPerSeat,
            extraBaggage: doc.data().extraBaggage,
            approvalIns: doc.data().approvalIns,
            smoking: doc.data().smoking,
            onlyWoman: doc.data().onlyWoman,
            allGender: doc.data().allGender,
            onlyWoman: doc.data().onlyWoman,
            nSeatsAvailable: doc.data().nSeatsAvailable,
            date: doc.data().date,
            startTime: doc.data().startTime,
            destinationDetails: doc.data().destinationDetails,
            originDetails: doc.data().originDetails,
            durationMinutes: doc.data().durationMinutes,
            nameDriver: driverRef.data().name + " " + driverRef.data().apellido,
            driverPhoto: driverRef.data().photo,
            nRating: driverRef.data().driverData.nRating,
            sRating: driverRef.data().driverData.sRating,
          });
      }
    const requiredParameters = JSON.stringify(resultDataHard);
    res.send(requiredParameters);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error");
  }
};

export const getDetailsOfTravel = async (req, res) => {
  var travelId = req.params.travelId;
  try {
    var travelRef = await db.collection("travels").doc(travelId).get();
    var driverRef = await db
      .collection("users")
      .doc(travelRef.data().driverUID)
      .get();

    const objSend = {
      seen: travelRef.data().seen,
      routeCoordinates: travelRef.data().routeCoordinates,
      nSeatsOffered: travelRef.data().nSeatsOffered,
      usb: driverRef.data().driverData.usb,
      airConditioning: driverRef.data().driverData.airConditioning,
      carSeats: driverRef.data().driverData.carSeats,
      carColor: driverRef.data().driverData.carColor,
      typeVehicule: driverRef.data().driverData.typeVehicule,
      carPhoto: driverRef.data().driverData.carPhoto,
    };
    const requiredParameters = JSON.stringify(objSend);
    res.send(requiredParameters);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error");
  }
};

export const UpdateSeenTravel = async (req, res) => {
  var { travelId } = req.body;
  try {
    const travelRef = db.collection("travels").doc(travelId);
    const response = await travelRef.update({
      seen: FieldValue.increment(1),
    });
    res.json({ sucess: true });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error");
  }
};

export async function registerPassengerRequest(req, res) {
  const { travelId, passengerUID, extraBaggage, pickUp, dropOff, payMode } =
    req.body;
  try {
    const travelRef = db.collection("travels").doc(travelId);
    const requestRef = db.collection("requestTravel");

    const travelObj = (await travelRef.get()).data();

    //Se comprueba si es posible agregar equipaje al viaje
    var bigBags = 0;
    var personalItem = 0;
    if (
      (extraBaggage.bigBags && travelObj.extraBaggage.bigBags == 0) ||
      (extraBaggage.personalItem && travelObj.extraBaggage.personalItem == 0)
    ) {
      res
        .status(403)
        .json({ sucess: false, error: "Equipaje extra no disponible" });
      return;
    }
    if (extraBaggage.bigBags) bigBags = -1;
    if (extraBaggage.personalItem) personalItem = -1;

    //Se comprueba que no tiene ya una solicitud para ese viaje
    for (var i = 0; i < travelObj.requestingPassengers.length; i++) {
      console.log(travelObj.requestingPassengers[i])
      var requestObj = (await requestRef
        .doc(travelObj.requestingPassengers[i])
        .get()).data();
      console.log(requestObj.passengerUID, passengerUID)
      if (requestObj.passengerUID === passengerUID) {
        res
          .status(403)
          .json({ sucess: false, error: "Ya tienes una solicitud en este viaje" });
        return;
      }
    }

    //Se comprueba que el viaje no le calze en el horario de otro viaje

    //las solicitudes de viaje pueden estar, accepted, refused, o pending
    //En esta mpv todas se registran como accepted
    const requestRes = await requestRef.add({
      passengerUID: passengerUID,
      extraBaggage: extraBaggage,
      pickUp: pickUp,
      dropOff: dropOff,
      payMode: payMode,
      travelId: travelId,
      status: "accepted",
    });
    const travelRes = await travelRef.update({
      requestingPassengers: FieldValue.arrayUnion(requestRes.id),
      "extraBaggage.bigBags": FieldValue.increment(bigBags),
      "extraBaggage.personalItem": FieldValue.increment(personalItem),
      nSeatsAvailable: FieldValue.increment(-1),
    });
    res.json({ sucess: true });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error");
  }
}
