import React from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { Entypo, Ionicons } from "@expo/vector-icons";

import SearchStepOne from "../screens/searchTrip/SearchStepOne";
import SearchStepTwo from "../screens/searchTrip/SearchStepTwo";
import { COLORS, hp, wp } from "../constants/styleThemes";

const SearchNavigator = () => {
  const SearchStack = createStackNavigator();

  return (
    <SearchStack.Navigator>
      <SearchStack.Screen
        name="SeachStepOne"
        component={SearchStepOne}
        options={({ navigation }) => ({
          headerShown: true,
          headerStyle: styles.headerContainer,
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerText,
          headerTitle: (props) => (
            <Image
              style={{
                width: wp("11.8"),
                height: hp("6.95"),
                tintColor: COLORS.WHITE,
              }}
              source={require("../../assets/images/miniLogo.png")}
            />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => console.log("chat")}>
              <Entypo
                name="chat"
                size={hp("5%")}
                color={COLORS.WHITE}
                style={{ marginRight: wp("3%") }}
              />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Entypo
                name="menu"
                size={hp("5%")}
                color={COLORS.WHITE}
                style={{ marginLeft: wp("3%") }}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <SearchStack.Screen
        name="SeachStepTwo"
        component={SearchStepTwo}
        options={({ navigation }) => ({
          headerShown: true,
          title: "busqueda2",
          headerStyle: styles.headerContainer,
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerText,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("SeachStepOne")}
            >
              <Ionicons
                name="md-chevron-back"
                size={hp("5%")}
                color={COLORS.WHITE}
                style={{ marginLeft: wp("3%") }}
              />
            </TouchableOpacity>
          ),
        })}
      />
    </SearchStack.Navigator>
  );
};

export default SearchNavigator;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.TURKEY,
    height: hp("7%"),
  },
  headerText: {
    color: COLORS.WHITE,
    fontFamily: "Gotham-SSm-Book",
    fontSize: hp("3.5%"),
  },
});
