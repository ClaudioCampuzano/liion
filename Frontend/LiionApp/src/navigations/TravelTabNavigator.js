import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import TravelConductorTab from "../screens/travel/TravelConductorTab";
import TravelPasajeroTab from "../screens/travel/TravelPasajeroTab";

import { COLORS, hp, wp } from "../constants/styleThemes";
import { GlobalContext } from "../context/Provider";

const TravelTabNavigator = () => {
  const { userFirestoreData } = useContext(GlobalContext);

  const trabelTab = createMaterialTopTabNavigator();

  return (
    <trabelTab.Navigator
      screenOptions={{
        tabBarInactiveTintColor: COLORS.LIGHT_LEAD,
        tabBarActiveTintColor: COLORS.TURKEY,
        tabBarPressColor: COLORS.TURKEY,
        tabBarIndicatorStyle: { backgroundColor: COLORS.TURKEY },
      }}
    >
      {userFirestoreData.isDriver && (
        <trabelTab.Screen
          name="TravelConductorTab"
          component={TravelConductorTab}
          options={({ navigation }) => ({
            headerShown: false,
            tabBarLabel: "Conductor",
            tabBarLabelStyle: styles.labelTab,
          })}
        />
      )}
      <trabelTab.Screen
        name="TravelPasajeroTab"
        component={TravelPasajeroTab}
        options={({ navigation }) => ({
          headerShown: false,
          tabBarLabel: "Pasajero",
          tabBarLabelStyle: styles.labelTab,
        })}
      />
    </trabelTab.Navigator>
  );
};

export default TravelTabNavigator;

const styles = StyleSheet.create({
  labelTab: {
    fontFamily: "Gotham-SSm-Medium",
    fontSize: hp("2%"),
  },
});
