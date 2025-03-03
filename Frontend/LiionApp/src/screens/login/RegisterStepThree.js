import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

import Layout from "../../components/Layout";
import ButtonLiion from "../../components/ButtonLiion";
import InputLiion from "../../components/InputLiion";
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper";
import ModalPopUp from "../../components/ModalPopUp";

import { COLORS, hp, wp } from "../../constants/styleThemes";
import { validateEmail, validatePassword } from "../../utils/utils";
import { useKeyboard } from "../../hooks/useKeyboard";
import { registerBackend } from "../../api/api";
import Loading from "../../components/Loading";

const RegisterStepThree = ({ route, navigation }) => {
  const [valueEmail, setValueEmail] = useState("");
  const [valuePass, setValuePass] = useState("");
  const [valuePassConfirm, setValuePassConfirm] = useState("");

  const [errorEmail, setErrorEmail] = useState(null);
  const [errorPass, setErrorPass] = useState(null);
  const [errorPassConfirm, setErrorPassConfirm] = useState(null);

  const [focusEmailInput, setfocusEmailInput] = useState(false);
  const [focusPasswordInput, setfocusPasswordInput] = useState(false);
  const [focusPasswordConfirmInput, setfocusPasswordConfirmInput] =
    useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalError, setModalError] = useState(false);

  const { isKeyboardVisible } = useKeyboard();
  const { name, lastname, run, dateBirth, gender, photo } = route.params;

  const [waitingRegister, setWaitingRegister] = useState(false);

  useEffect(() => {
    if (valueEmail != "") setErrorEmail(null);
    if (valuePass != "") setErrorPass(null);
    if (valuePassConfirm != "") setErrorPassConfirm(null);
  }, [valueEmail, valuePass, valuePassConfirm]);

  useEffect(() => {
    if (valueEmail != "")
      if (!validateEmail(valueEmail))
        setErrorEmail("Formato de email incorrecto");
      else setErrorEmail(null);

    if (valuePass != "")
      if (!validatePassword(valuePass))
        setErrorPass(
          "Debe tener a lo menos 8 caracteres, mayusculas, minusculas, y numeros"
        );
      else setErrorPass(null);

    if (valuePassConfirm != "")
      if (valuePass != valuePassConfirm)
        setErrorPassConfirm("Las constraseñas no coinciden");
      else setErrorPassConfirm(null);
  }, [
    focusEmailInput,
    focusPasswordInput,
    focusPasswordConfirmInput,
    isKeyboardVisible,
  ]);

  const checkValidator = () => {
    if (valueEmail == "") setErrorEmail("Falta que ingreses tu email");
    else if (!validateEmail(valueEmail))
      setErrorEmail("Formato de email incorrecto");
    else setErrorEmail(null);

    if (valuePass == "") setErrorPass("Falta tu contraseña");
    else if (!validatePassword(valuePass))
      setErrorPass(
        "Debe tener a lo menos 8 caracteres, mayusculas, minusculas, y numeros"
      );
    else setErrorPass(null);

    if (valuePassConfirm == "") setErrorPassConfirm("Falta la confirmacion");
    else if (valuePass != valuePassConfirm)
      setErrorPassConfirm("Las constraseñas no coinciden");
    else setErrorPassConfirm(null);

    if (
      validateEmail(valueEmail) &&
      validatePassword(valuePass) &&
      valuePass == valuePassConfirm
    ) {
      setWaitingRegister(true);
      (async function () {
        const [resval, resmsg] = await registerBackend({
          name: name,
          lastname: lastname,
          run: run,
          email: valueEmail,
          password: valuePass,
          birth: dateBirth,
          gender: gender,
          isDriver: false,
          photo64: photo
        });
        if (resval) {
          setModalError(false);
          setModalVisible(true);
          setWaitingRegister(false);
        } else {
          setModalError(true);
          setModalVisible(true);
          setWaitingRegister(false);
        }
      })();
    }
  };

  const modalHandler = () => {
    navigation.navigate("AccountAccess", { email: valueEmail });
    setModalVisible(false);
  };

  return (
    <Layout>
      {waitingRegister ? (
        <Loading />
      ) : (
        <KeyboardAvoidingWrapper>
          <View
            style={{
              height: hp("78%"),
            }}
          >
            {modalError ? (
              <ModalPopUp
                visible={modalVisible}
                setModalVisible={setModalVisible}
              >
                Errores en el registro, consulte con el administrador
              </ModalPopUp>
            ) : (
              <ModalPopUp
                visible={modalVisible}
                setModalVisible={setModalVisible}
                customFunction={modalHandler}
              >
                Registro exitoso, ahora puedes ingresar tus credenciales
              </ModalPopUp>
            )}
            <Text style={styles.text_titulo}>Correo electrónico </Text>
            <Text style={styles.text_subTitulo}>
              Aquí te enviaremos los recibos e informaciónes sobre tus viajes
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <InputLiion
                style={styles.input}
                label="Email"
                value={valueEmail}
                errorText={errorEmail}
                secureTextEntry={false}
                onBlur={() => setfocusEmailInput(false)}
                onFocus={() => setfocusEmailInput(true)}
                onChangeText={(text) => setValueEmail(text)}
              />
              <InputLiion
                style={styles.input}
                label="Contraseña"
                value={valuePass}
                errorText={errorPass}
                onBlur={() => setfocusPasswordInput(false)}
                onFocus={() => setfocusPasswordInput(true)}
                secureTextEntry={true}
                onChangeText={(text) => setValuePass(text)}
              />
              <InputLiion
                style={styles.input}
                label="Confirma tu contraseña"
                value={valuePassConfirm}
                errorText={errorPassConfirm}
                onBlur={() => setfocusPasswordConfirmInput(false)}
                onFocus={() => setfocusPasswordConfirmInput(true)}
                secureTextEntry={true}
                onChangeText={(text) => setValuePassConfirm(text)}
              />
                                        <Text style={styles.text_pass}>
              {'La contraseña debe ser mayor o igual a 8 caracteres\ny ser una combinación de letras mayúsculas,\nminúsculas y números\n'}
            </Text>
            </ScrollView>
          </View>
          <View style={styles.buttonView}>
            <ButtonLiion
              title="Registrar"
              styleView={styles.button}
              onPress={() => checkValidator()}
            />
          </View>
        </KeyboardAvoidingWrapper>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  text_titulo: {
    fontFamily: "Gotham-SSm-Bold",
    fontSize: hp("3%"),
    color: COLORS.TURKEY,
    paddingTop: hp("6%"),
    textAlign: "center",
  },
  text_subTitulo: {
    fontFamily: "Gotham-SSm-Medium",
    fontSize: hp("2.5%"),
    color: COLORS.TURKEY_CLEAR,
    paddingTop: hp("6%"),
    textAlign: "center",
    paddingBottom: hp("5%"),
  },
  text_pass:{
    fontFamily: "Gotham-SSm-Medium",
    fontSize: hp("1.5%"),
    color: COLORS.TURKEY_CLEAR,
    paddingTop: hp("1.8%"),
    textAlign: "center",
  },
  input: {
    marginTop: hp("1.8%"),
    width: wp("78.6%"),
    alignSelf: "center",
  },
  buttonView: {
    flex: 1,
    height: hp("15%"),
    justifyContent: "flex-end",
    paddingBottom: hp("8%"),
  },
  button: {
    width: wp("78.6%"),
    height: hp("4.8%"),
    alignSelf: "center",
  },
});

export default RegisterStepThree;
