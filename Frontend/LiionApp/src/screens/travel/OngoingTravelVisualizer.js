import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import * as Location from "expo-location";
import {
  AntDesign,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Avatar } from "react-native-paper";
import { reverseGeocodeAsync } from "expo-location";
import { useQuery } from "react-query";

import ButtonLiion from "../../components/ButtonLiion";

import { GlobalContext } from "../../context/Provider";
import MapOngoingTravel from "../../components/MapOngoingTravel";
import Loading from "../../components/Loading";
import Layout from "../../components/Layout";
import ModalPopUp from "../../components/ModalPopUp";
import ModalPopUpDecision from "../../components/ModalPopUpDecision";
import { COLORS, hp, wp } from "../../constants/styleThemes";
import {
  getRouteCoordinates,
  getTravelItinerary,
  updateTravelItinerary,
  getDetailsOfTravel,
} from "../../api/api";

const OngoingTravelVisualizer = ({ navigation, route }) => {
  //const { uid, userData } = useContext(GlobalContext);
  const { id } = route.params;
  const [userLocation, setUserLocation] = useState(() => {
    return { latitude: 0, longitude: 0 };
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [modalErrorState, setModalErrorState] = useState(false);
  const [modalDecisionState, setModalDecisionState] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [nameDirection, setNameDirection] = useState("");

  const sheetRef = useRef();
  const cameraRef = useRef();
  const snapPoints = ["70%"];

  const lugar = {
    type: "bajada",
    site: "Alameda 758, Santiago de chile, con todos",
  };
  const datos = {
    name: "Jairo Moreno",
    extraBaggage: { bigBags: false, personalItem: true },
    photoUrl:
      "https://firebasestorage.googleapis.com/v0/b/liion-carpoolapp.appspot.com/o/profile-images%2F0kodaMgFnFM0tVNkPIxAMFCsoED2.jpg?alt=media&token=0kodaMgFnFM0tVNkPIxAMFCsoED2",
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Se ha denegado el permiso de acceder a la ubicación");
        setModalErrorState(true);
        return;
      }
      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 15 },
        (loc) =>
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          })
      );
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Se ha denegado el permiso de acceder a la camara");
        setModalErrorState(true);
        return;
      }
    })();
  }, []);

  /*   useEffect(() => {
    if (userLocation != null) console.log(userLocation);
           (async () => {
        var data = {
          travelId: id,
          uid: uid,
          location: location,
        };
        await updateUserLocationInTravel(data);
      })(); 
  }, [userLocation]); */

  const {
    data: dataRoute,
    isLoading: isLoadingRoute,
    isError: isErrorRoute,
  } = useQuery(
    ["routeCoordinate", id],
    () => getRouteCoordinates({ travelId: id }),
    {
      refetchOnMount: false,
    }
  );

  const {
    data: dataItinerary,
    isLoading: isLoadingItinerary,
    isError: isErrorItinerary,
  } = useQuery(
    ["travelItinerary", id],
    () => getTravelItinerary({ travelId: id }),
    {
      refetchOnMount: false,
      refetchInterval: 6000,
    }
  );

  //isError && setModalErrorState(true);

  const handleSnapOpen = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
    setIsSheetOpen(true);
  }, []);

  const handleSnapClose = useCallback(() => {
    sheetRef.current?.close();
    setIsSheetOpen(false);
  }, []);

  const modalHandler = () => {
    navigation.goBack();
    setModalErrorState(false);
  };

  const modalStateHandler = () => {
    console.log("REGISTRAR BAJADA");
    setModalDecisionState(false);
  };

  const handleCamScaned = (result) => {
    console.log("REGISTRAR SUBIDA");
    handleSnapClose();
  };

  const getReverseGeocode = async (ObjCoord) => {
    var name =
      address[0].street + " " + address[0].name + ", " + address[0].city;
    console.log(name);
    return String(name);
  };

  useEffect(() => {
    (async () => {
      var address = await reverseGeocodeAsync(dataItinerary.coordinate);
      setNameDirection(
        address[0].street + " " + address[0].name + ", " + address[0].city
      );
    })();
  }, [dataItinerary.coordinate]);

  return (
    <Layout>
      {isLoadingRoute && isLoadingItinerary ? (
        <Loading />
      ) : (
        <>
          <ModalPopUp
            visible={modalErrorState}
            setModalVisible={setModalErrorState}
            customFunction={modalHandler}
          >
            {errorMsg}
          </ModalPopUp>
          <ModalPopUpDecision
            visible={modalDecisionState}
            setModalVisible={setModalDecisionState}
            customFunction={modalStateHandler}
          >
            {"Registrara una bajada, ¿Desea continuar?"}
          </ModalPopUpDecision>
          <TouchableWithoutFeedback
            onPress={() => isSheetOpen && handleSnapClose()}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: COLORS.WHITE,
              }}
            >
              <MapOngoingTravel
                dimensions={styles.mapDimensions}
                coordinateList={dataRoute.routeCoordinates}
                origin={userLocation}
                destiny={
                  dataRoute.routeCoordinates[
                    dataRoute.routeCoordinates.length - 1
                  ]
                }
                navigation={navigation}
                typePassenger={"driver"}
                markers={""}
              />
              <View style={styles.floatingSheet}>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: hp(1),
                    justifyContent: "space-evenly",
                  }}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      width: wp(55),
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={[styles.labelText, { fontSize: hp(2.5) }]}>
                        {dataItinerary.fullName}
                      </Text>
                      {dataItinerary.extraBaggage.personalItem && (
                        <MaterialCommunityIcons
                          name="bag-personal-outline"
                          size={hp("4")}
                          color={COLORS.TURKEY}
                        />
                      )}
                      {dataItinerary.extraBaggage.bigBags && (
                        <FontAwesome5
                          name="suitcase-rolling"
                          size={hp("4")}
                          color={COLORS.TURKEY}
                        />
                      )}
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <MaterialIcons
                        name="directions-walk"
                        size={24}
                        color={COLORS.TURKEY}
                        style={
                          dataItinerary.type === "dropOff" && {
                            transform: [{ rotateY: "180deg" }],
                          }
                        }
                      />
                      <Text style={styles.labelText}>
                        {(dataItinerary.type === "pickUp"
                          ? "Subida en "
                          : "Bajada en ") + nameDirection}
                      </Text>
                    </View>
                  </View>
                  <Avatar.Image
                    source={{
                      uri: datos.photoUrl,
                    }}
                    size={hp("9")}
                    style={{}}
                  />
                </View>

                {dataItinerary.type === "pickUp" ? (
                  <TouchableOpacity onPress={() => handleSnapOpen(0)}>
                    <View style={styles.containerQr}>
                      <AntDesign
                        name="qrcode"
                        size={45}
                        color={COLORS.TURKEY}
                      />
                      <Text style={styles.textQr}>
                        {"Registrar subida de pasajero"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.buttonView}>
                    <ButtonLiion
                      title="Registrar bajada"
                      styleView={styles.button}
                      onPress={() => setModalDecisionState(true)}
                    />
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>

          <BottomSheet
            ref={sheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            onClose={() => setIsSheetOpen(false)}
            index={-1}
          >
            <BottomSheetView style={{ alignItems: "center" }}>
              <Text style={styles.textQr}>
                {"Escaneé el codigo QR\ndel pasajero"}
              </Text>
              {isSheetOpen && (
                <Camera
                  ref={cameraRef}
                  style={styles.camContainer}
                  type={Camera.Constants.Type.back}
                  autoFocus={Camera.Constants.AutoFocus.on}
                  barCodeScannerSettings={{
                    barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
                  }}
                  onBarCodeScanned={(result) => handleCamScaned(result)}
                />
              )}
            </BottomSheetView>
          </BottomSheet>
        </>
      )}
    </Layout>
  );
};

export default OngoingTravelVisualizer;

const styles = StyleSheet.create({
  camContainer: {
    marginTop: hp(3),
    height: hp("50%"),
    width: wp("90%"),
  },
  mapDimensions: {
    height: hp("100%"),
    width: wp("100%"),
  },
  floatingSheet: {
    position: "absolute",
    height: hp(20),
    width: wp(90),
    bottom: hp(1),
    borderRadius: hp(5),
    elevation: 5,
    backgroundColor: COLORS.WHITE,
  },
  textQr: {
    fontFamily: "Gotham-SSm-Bold",
    fontSize: hp("2.4%"),
    textAlign: "center",
    color: COLORS.TURKEY,
  },
  labelText: {
    color: COLORS.BLACK,
    fontSize: hp("1.5%"),
    fontFamily: "Gotham-SSm-Medium",
  },
  containerQr: {
    alignItems: "center",
  },
  buttonView: {
    flex: 1,
    height: hp("23%"),
    justifyContent: "flex-end",
    paddingBottom: hp("1.5%"),
  },
  button: {
    width: wp("60%"),
    height: hp("4.8%"),
    alignSelf: "center",
  },
});
