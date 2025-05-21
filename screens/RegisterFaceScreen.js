// FaceIdDemoApp/screens/RegisterFaceScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform, // Thêm Platform để kiểm tra
  TouchableOpacity, // Dùng TouchableOpacity cho nút custom nếu muốn
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { registerFace } from "../services/FaceIDApiService"; // Import service

export default function RegisterFaceScreen() {
  const [userId, setUserId] = useState("");
  const [image, setImage] = useState(null); // Lưu URI của ảnh được chọn để preview
  const [imageBase64, setImageBase64] = useState(null); // Lưu chuỗi base64 của ảnh để gửi
  const [isLoading, setIsLoading] = useState(false);

  const requestMediaLibraryPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to make this work!"
        );
        return false;
      }
      return true;
    }
    return true; // Trên web không cần xin quyền này theo cách tương tự
  };

  const requestCameraPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera permissions to make this work!"
        );
        return false;
      }
      return true;
    }
    return true;
  };

  const processImagePickerResult = (result) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      setImage(selectedAsset.uri);

      if (selectedAsset.base64) {
        const mimeType =
          selectedAsset.mimeType ||
          (selectedAsset.uri.endsWith(".png")
            ? "image/png"
            : selectedAsset.uri.endsWith(".jpg") ||
              selectedAsset.uri.endsWith(".jpeg")
            ? "image/jpeg"
            : "image/jpeg");

        const base64WithPrefix = `data:${mimeType};base64,${selectedAsset.base64}`;
        setImageBase64(base64WithPrefix);
        // console.log("Constructed base64 (RegisterScreen - first 100):", base64WithPrefix.substring(0,100));
      } else {
        Alert.alert("Error", "Could not get base64 data from image.");
        setImageBase64(null);
      }
    } else {
      // User cancelled picker or result.assets is empty
      // No need to alert, just don't update state
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Giữ nguyên false như đã quyết định
      // aspect: [1, 1], // Bỏ qua nếu allowsEditing là false, hoặc đặt để hướng dẫn nếu có edit
      quality: 1, // Chất lượng tối đa
      base64: true,
    });
    processImagePickerResult(result);
  };

  const takePhotoWithCamera = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false, // Giữ nguyên false
      // aspect: [1, 1],
      quality: 1,
      base64: true,
    });
    processImagePickerResult(result);
  };

  const handleRegister = async () => {
    const trimmedUserId = userId.trim(); // Loại bỏ khoảng trắng thừa
    if (!trimmedUserId) {
      Alert.alert(
        "Validation Error",
        "User ID cannot be empty or just whitespace."
      );
      return;
    }
    if (!imageBase64) {
      Alert.alert("Validation Error", "Please select or take an image.");
      return;
    }

    setIsLoading(true);
    try {
      // Sử dụng trimmedUserId khi gọi API
      const response = await registerFace(trimmedUserId, imageBase64);
      Alert.alert("Success", `${response.message}`); // message từ backend đã đủ thông tin

      // Reset form sau khi đăng ký thành công
      setUserId("");
      setImage(null);
      setImageBase64(null);
    } catch (error) {
      const errorMessage =
        error.detail ||
        error.message ||
        "An unknown error occurred during registration.";
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register New Face Sample</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter User ID (e.g., nguyen van a)"
        value={userId}
        onChangeText={setUserId} // Không cần trim ở đây, sẽ trim khi submit
        autoCapitalize="none"
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Pick Image from Gallery"
          onPress={pickImageFromGallery}
        />
        <View style={{ marginVertical: 5 }} /> {/* Khoảng cách giữa các nút */}
        <Button title="Take Photo with Camera" onPress={takePhotoWithCamera} />
      </View>

      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      {/* Dùng để debug base64 nếu cần
            {imageBase64 && (
                <Text style={{fontSize: 8, margin: 5, color: 'gray'}}>
                    Base64 Preview (first 50): {imageBase64.substring(0,50)}...
                </Text>
            )}
            */}

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <View style={styles.submitButton}>
          <Button
            title="Register This Face Sample"
            onPress={handleRegister}
            disabled={!userId.trim() || !imageBase64} // Vẫn trim ở đây để disable nút cho UX
            color="#007AFF"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#333",
  },
  input: {
    width: "90%",
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  buttonContainer: {
    width: "80%",
    marginBottom: 20,
  },
  imagePreview: {
    width: 200,
    height: 200,
    resizeMode: "contain", // 'cover' or 'contain'
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8, // Bo góc cho preview
  },
  submitButton: {
    width: "80%",
    marginTop: 10,
  },
  loader: {
    marginTop: 20,
  },
});
