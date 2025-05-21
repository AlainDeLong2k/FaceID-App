// FaceIdDemoApp/screens/VerifyFaceScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
// (Nếu bạn quyết định dùng expo-camera trực tiếp, import ở đây)
// import { Camera } from 'expo-camera';
import { Picker } from "@react-native-picker/picker"; // Thư viện để tạo dropdown/select
import { verifyFace, getRegisteredUsers } from "../services/FaceIDApiService"; // Import service

export default function VerifyFaceScreen() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [availableUserIds, setAvailableUserIds] = useState([]);
  const [imageToCheck, setImageToCheck] = useState(null); // URI của ảnh
  const [imageBase64ToCheck, setImageBase64ToCheck] = useState(null); // Base64 của ảnh
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null); // {is_same_person, confidence_score, ...}

  // Load danh sách user ID đã đăng ký khi component được mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getRegisteredUsers(); // Gọi API lấy danh sách user
        if (users && users.length > 0) {
          setAvailableUserIds(users);
          setSelectedUserId(users[0]); // Chọn user đầu tiên làm mặc định
        } else {
          setAvailableUserIds([]);
          Alert.alert(
            "No Users",
            "No users registered in the backend to verify against."
          );
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "Could not fetch registered users from the backend."
        );
      }
    };
    fetchUsers();
  }, []);

  const pickImageFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You've refused to allow this app to access your photos!"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: false,
      aspect: [1, 1], // Giữ vuông cho nhất quán
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      //   setImageToCheck(result.assets[0].uri);
      //   const mimeType =
      //     result.assets[0].mimeType ||
      //     (result.assets[0].uri.endsWith(".png") ? "image/png" : "image/jpeg");
      //   const base64WithPrefix = `data:<span class="math-inline">\{mimeType\};base64,</span>{result.assets[0].base64}`;
      //   setImageBase64ToCheck(base64WithPrefix);
      //   setVerificationResult(null); // Xóa kết quả cũ khi chọn ảnh mới

      setImageToCheck(result.assets[0].uri);

      console.log("Asset URI:", result.assets[0].uri);
      console.log("Asset MIME Type:", result.assets[0].mimeType);
      console.log(
        "Asset Base64 (first 20 chars):",
        result.assets[0].base64
          ? result.assets[0].base64.substring(0, 20)
          : "No base64 data"
      );
      console.log("Asset Base64 exists:", !!result.assets[0].base64);

      const imageUri = result.assets[0].uri;
      const rawBase64Data = result.assets[0].base64;

      // Xác định mimeType một cách cẩn thận hơn
      let determinedMimeType = result.assets[0].mimeType;
      if (!determinedMimeType && imageUri) {
        // Nếu mimeType không có, thử suy ra từ uri
        if (imageUri.endsWith(".png")) {
          determinedMimeType = "image/png";
        } else if (imageUri.endsWith(".jpg") || imageUri.endsWith(".jpeg")) {
          determinedMimeType = "image/jpeg";
        } else {
          determinedMimeType = "image/jpeg"; // Mặc định là jpeg nếu không rõ
          console.warn(
            "Could not determine MIME type from URI, defaulting to image/jpeg"
          );
        }
      }
      console.log("Determined MIME Type:", determinedMimeType);

      if (!rawBase64Data) {
        Alert.alert("Error", "Base64 data is missing from the selected image.");
        setIsLoading(false); // Nhớ dừng loading nếu có lỗi
        return;
      }
      if (!determinedMimeType) {
        Alert.alert("Error", "Could not determine MIME type for the image.");
        setIsLoading(false);
        return;
      }

      const base64WithPrefix = `data:${determinedMimeType};base64,${rawBase64Data}`;
      console.log(
        "Constructed base64WithPrefix (first 100 chars):",
        base64WithPrefix.substring(0, 100)
      ); // Kiểm tra lại ở đây

      setImageBase64ToCheck(base64WithPrefix);
      setVerificationResult(null);
    }
  };

  const takePhotoWithCamera = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    // Hoặc dùng expo-camera: const { status } = await Camera.requestCameraPermissionsAsync();
    if (cameraPermission.granted === false) {
      Alert.alert(
        "Permission Required",
        "You've refused to allow this app to access your camera!"
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      // setImageToCheck(result.assets[0].uri);
      // const mimeType =
      //   result.assets[0].mimeType ||
      //   (result.assets[0].uri.endsWith(".png") ? "image/png" : "image/jpeg");
      // //   const base64WithPrefix = `data:<span class="math-inline">\{mimeType\};base64,</span>{result.assets[0].base64}`;
      // const base64WithPrefix = `data:${mimeType};base64,${result.assets[0].base64}`;
      // setImageBase64ToCheck(base64WithPrefix);
      // setVerificationResult(null); // Xóa kết quả cũ khi chụp ảnh mới

      setImageToCheck(result.assets[0].uri);

      console.log("Asset URI:", result.assets[0].uri);
      console.log("Asset MIME Type:", result.assets[0].mimeType);
      console.log(
        "Asset Base64 (first 20 chars):",
        result.assets[0].base64
          ? result.assets[0].base64.substring(0, 20)
          : "No base64 data"
      );
      console.log("Asset Base64 exists:", !!result.assets[0].base64);

      const imageUri = result.assets[0].uri;
      const rawBase64Data = result.assets[0].base64;

      // Xác định mimeType một cách cẩn thận hơn
      let determinedMimeType = result.assets[0].mimeType;
      if (!determinedMimeType && imageUri) {
        // Nếu mimeType không có, thử suy ra từ uri
        if (imageUri.endsWith(".png")) {
          determinedMimeType = "image/png";
        } else if (imageUri.endsWith(".jpg") || imageUri.endsWith(".jpeg")) {
          determinedMimeType = "image/jpeg";
        } else {
          determinedMimeType = "image/jpeg"; // Mặc định là jpeg nếu không rõ
          console.warn(
            "Could not determine MIME type from URI, defaulting to image/jpeg"
          );
        }
      }
      console.log("Determined MIME Type:", determinedMimeType);

      if (!rawBase64Data) {
        Alert.alert("Error", "Base64 data is missing from the selected image.");
        setIsLoading(false); // Nhớ dừng loading nếu có lỗi
        return;
      }
      if (!determinedMimeType) {
        Alert.alert("Error", "Could not determine MIME type for the image.");
        setIsLoading(false);
        return;
      }

      const base64WithPrefix = `data:${determinedMimeType};base64,${rawBase64Data}`;
      console.log(
        "Constructed base64WithPrefix (first 100 chars):",
        base64WithPrefix.substring(0, 100)
      ); // Kiểm tra lại ở đây

      setImageBase64ToCheck(base64WithPrefix);
      setVerificationResult(null);
    }
  };

  const handleVerify = async () => {
    if (!selectedUserId) {
      Alert.alert(
        "Validation Error",
        "Please select a User ID to verify against."
      );
      return;
    }
    if (!imageBase64ToCheck) {
      Alert.alert("Validation Error", "Please pick or take an image to check.");
      return;
    }

    console.log(
      "Base64 string being sent (first 100 chars):",
      imageBase64ToCheck.substring(0, 100)
    ); // In ra 100 ký tự đầu

    setIsLoading(true);
    setVerificationResult(null);
    try {
      const response = await verifyFace(selectedUserId, imageBase64ToCheck);
      setVerificationResult(response); // Lưu lại toàn bộ response
      // Alert.alert(
      //     "Verification Result",
      //     `Match: ${response.is_same_person}\nConfidence: ${response.confidence_score.toFixed(2)}\nDistance: ${response.min_distance_found ? response.min_distance_found.toFixed(4) : 'N/A'}`
      // );
    } catch (error) {
      const errorMessage =
        error.detail ||
        error.message ||
        "An unknown error occurred during verification.";
      Alert.alert("Verification Failed", errorMessage);
      setVerificationResult({ error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Verify Face</Text>

      {availableUserIds.length > 0 ? (
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Select User ID to Verify Against:</Text>
          <Picker
            selectedValue={selectedUserId}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedUserId(itemValue)}
          >
            {availableUserIds.map((id) => (
              <Picker.Item key={id} label={id} value={id} />
            ))}
          </Picker>
        </View>
      ) : (
        <Text>Loading registered users or no users available...</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Pick Image from Gallery"
          onPress={pickImageFromGallery}
        />
        <View style={{ marginVertical: 5 }} />
        <Button title="Take Photo with Camera" onPress={takePhotoWithCamera} />
      </View>

      {imageToCheck && (
        <Image source={{ uri: imageToCheck }} style={styles.imagePreview} />
      )}

      {isLoading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      )}

      {!isLoading && imageToCheck && selectedUserId && (
        <Button title="Verify This Face" onPress={handleVerify} />
      )}

      {verificationResult && !isLoading && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Verification Result:</Text>
          {verificationResult.error ? (
            <Text style={styles.resultTextError}>
              {verificationResult.error}
            </Text>
          ) : (
            <>
              <Text style={styles.resultText}>
                Match with {selectedUserId}:{" "}
                <Text
                  style={{
                    fontWeight: "bold",
                    color: verificationResult.is_same_person ? "green" : "red",
                  }}
                >
                  {String(verificationResult.is_same_person)}
                </Text>
              </Text>
              <Text style={styles.resultText}>
                Confidence Score:{" "}
                {verificationResult.confidence_score.toFixed(3)}
              </Text>
              {verificationResult.min_distance_found !== null && (
                <Text style={styles.resultText}>
                  Min Distance Found:{" "}
                  {verificationResult.min_distance_found.toFixed(4)}
                </Text>
              )}
              <Text style={styles.resultText}>
                (Distance Threshold:{" "}
                {verificationResult.threshold_used_for_distance}, Confidence
                Threshold: {verificationResult.confidence_threshold_used})
              </Text>
              <Text style={styles.resultText}>
                Message: {verificationResult.message}
              </Text>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    // justifyContent: 'center', // Để ScrollView hoạt động tốt
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  pickerContainer: {
    width: "90%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginLeft: 5,
    marginTop: 5,
  },
  picker: {
    width: "100%",
    height: 50,
  },
  buttonContainer: {
    width: "80%",
    marginVertical: 10,
  },
  imagePreview: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "gray",
  },
  loader: {
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
    width: "90%",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
  resultTextError: {
    fontSize: 16,
    color: "red",
  },
});
