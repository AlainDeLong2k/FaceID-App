// FaceIdDemoApp/App.js
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Platform,
  StatusBar,
  Button,
  Text,
} from "react-native";
import RegisterFaceScreen from "./screens/RegisterFaceScreen";
import VerifyFaceScreen from "./screens/VerifyFaceScreen";

const SCREEN_REGISTER = "Register";
const SCREEN_VERIFY = "Verify";

export default function App() {
  // const [currentScreen, setCurrentScreen] = useState(SCREEN_VERIFY); // Màn hình mặc định khi mở app
  const [currentScreen, setCurrentScreen] = useState(SCREEN_REGISTER);

  let ScreenComponent;
  if (currentScreen === SCREEN_REGISTER) {
    ScreenComponent = <RegisterFaceScreen />;
  } else if (currentScreen === SCREEN_VERIFY) {
    ScreenComponent = <VerifyFaceScreen />;
  } else {
    ScreenComponent = <Text>Invalid Screen</Text>; // Trường hợp dự phòng
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navigationButtons}>
          <Button
            title="Go to Register Face"
            onPress={() => setCurrentScreen(SCREEN_REGISTER)}
            disabled={currentScreen === SCREEN_REGISTER}
          />
          <View style={{ width: 10 }} /> {/* Khoảng cách giữa 2 nút */}
          <Button
            title="Go to Verify Face"
            onPress={() => setCurrentScreen(SCREEN_VERIFY)}
            disabled={currentScreen === SCREEN_VERIFY}
          />
        </View>
        <View style={styles.screenContainer}>{ScreenComponent}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0", // Màu nền cho SafeAreaView
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    backgroundColor: "#ffffff",
  },
  screenContainer: {
    flex: 1, // Đảm bảo màn hình con chiếm phần còn lại
    backgroundColor: "#ffffff", // Màu nền cho khu vực màn hình
  },
});
