import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import { COLORS, hp, wp } from "../../constants/styleThemes";
import { FontAwesome } from "@expo/vector-icons";
import PlaceRow from "../PlaceRow";

import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Constants from "expo-constants";

import * as Location from "expo-location";

const InputLocation = (props) => {
  const { style, labelO, labelD, onBlur, onFocus, ...restOfProps } = props;

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  Location.installWebGeolocationPolyfill();

  useEffect(() => {
    if (origin != "" && destination != "") {
      props.onDataChange({ origin, destination });
    }
  }, [origin, destination]);

  useEffect(() => {
    (async () => {
      var { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      var location = await Location.getCurrentPositionAsync({});
    })();
  }, []);

  return (
    <SafeAreaView>
      <View style={[style, styles.container]}>
        <View style={styles.firstView}>
          <Text></Text>
        </View>
        <GooglePlacesAutocomplete
          placeholder={labelO}
          onPress={(data, details = null) => {
            console.log({
              vicinity: details.vicinity,
              formatted_address: details.formatted_address,
              location: details.geometry.location,
            });
          }}
          enablePoweredByContainer={false}
          suppressDefaultStyles
          currentLocation={true}
          currentLocationLabel="Locacion actual"
          styles={{
            textInput: { ...styles.textInput, ...styles.barSeparator },
            container: { ...styles.autocompleteContainer, top: 0 },
            listView: styles.listView,
            separator: styles.separator,
          }}
          textInputProps={{ placeholderTextColor: COLORS.LEAD }}
          fetchDetails
          minLength={4}
          query={{
            key: Constants.manifest.extra.firebase.apiKey,
            language: "es",
            components: "country:cl",
            radius: "5",
          }}
          renderRow={(data, index) => <PlaceRow data={data} index={index} />}
          renderDescription={(data) => data.description || data.vicinity}
        />
        <GooglePlacesAutocomplete
          placeholder={labelD}
          onPress={(data, details = null) => {
            console.log({data,details})
            console.log({
              vicinity: details.vicinity,
              formatted_address: details.formatted_address,
              location: details.geometry.location,
            });
          }}
          enablePoweredByContainer={false}
          suppressDefaultStyles
          minLength={4}
          textInputProps={{ placeholderTextColor: COLORS.LEAD }}
          styles={{
            textInput: styles.textInput,
            listView: styles.listViewSub,
            container: {
              ...styles.autocompleteContainer,
              top: 55,
            },
            separator: styles.separator,
          }}
          minLength={4}
          fetchDetails
          query={{
            key: Constants.manifest.extra.firebase.apiKey,
            language: "es",
            components: "country:cl",
          }}
          renderRow={(data, index) => <PlaceRow data={data} index={index} />}
        />
        <FontAwesome
          name="circle-o"
          size={20}
          color={COLORS.LEAD}
          style={styles.figure1}
        />
        <FontAwesome
          name="circle-o"
          size={5}
          color={COLORS.LEAD}
          style={styles.figure2}
        />
        <FontAwesome
          name="circle-o"
          size={5}
          color={COLORS.LEAD}
          style={styles.figure3}
        />
        <FontAwesome
          name="circle-o"
          size={5}
          color={COLORS.LEAD}
          style={styles.figure4}
        />

        <FontAwesome
          name="circle-o"
          size={20}
          color={COLORS.TURKEY}
          style={styles.figure5}
        />
      </View>
    </SafeAreaView>
  );
};

InputLocation.defaultProps = {
  onDataChange: () => {},
};

export default InputLocation;
const styles = StyleSheet.create({
  figure1: { top: 20, left: 15, position: "absolute" },
  figure2: { top: 45, left: 21, position: "absolute" },
  figure3: { top: 55, left: 21, position: "absolute" },
  figure4: { top: 65, left: 21, position: "absolute" },
  figure5: { top: 75, left: 15, position: "absolute" },

  firstView: {
    borderWidth: 1,
    borderRadius: 17,
    height: hp("14%"),
    width: wp("78.6%"),
    borderColor: COLORS.BORDER_COLOR,
  },
  barSeparator: {
    borderBottomColor: COLORS.LIGHT_LEAD,
    borderBottomWidth: 1,
    borderBottomStartRadius: 5,
    borderBottomEndRadius: 20,
    paddingBottom: 15,
  },

  autocompleteContainer: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 15,
  },
  separator: {
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 0,
    borderBottomStartRadius: 5,
    borderBottomEndRadius: 20,
    height: 1,
  },
  textInput: {
    padding: 10,
    marginVertical: 5,
    marginLeft: 30,
    fontFamily: "Gotham-SSm-Medium",
    color: COLORS.TURKEY,
    fontSize: hp("1.8%"),
  },
  listView: {
    position: "absolute",
    top: 115,
  },
  listViewSub: {
    position: "absolute",
    top: 60,
  },
  container: {
    padding: 0,
    height: hp("40%"),
  },
});
