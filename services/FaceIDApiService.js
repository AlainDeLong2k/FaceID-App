// FaceIdDemoApp/services/FaceIDApiService.js
import axios from "axios";

// THAY THẾ BẰNG ĐỊA CHỈ IP CỦA MÁY TÍNH CHẠY BACKEND VÀ PORT 8000
// Ví dụ: 'http://192.168.1.100:8000'
// Nếu chạy backend trên cùng máy và dùng Android Emulator, có thể là 'http://10.0.2.2:8000'
// Nếu chạy backend trên cùng máy và dùng iOS Simulator, có thể là 'http://localhost:8000'
const API_BASE_URL = "http://192.168.137.1:8000";
// const API_BASE_URL = "http://10.0.101.211:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerFace = async (userId, imageBase64) => {
  try {
    const response = await apiClient.post("/register_face", {
      user_id: userId,
      image_base64: imageBase64,
    });
    return response.data; // { message: "...", user_id: "..." }
  } catch (error) {
    console.error(
      "Error during face registration:",
      error.response ? error.response.data : error.message
    );
    throw error.response
      ? error.response.data
      : new Error("Network error or server unavailable");
  }
};

export const verifyFace = async (userIdToVerify, imageBase64ToCheck) => {
  try {
    const response = await apiClient.post("/verify_face", {
      user_id_to_verify: userIdToVerify,
      image_base64_to_check: imageBase64ToCheck,
    });
    // { is_same_person: bool, confidence_score: float, min_distance_found: float, ... }
    return response.data;
  } catch (error) {
    console.error(
      "Error during face verification:",
      error.response ? error.response.data : error.message
    );
    throw error.response
      ? error.response.data
      : new Error("Network error or server unavailable");
  }
};

export const getRegisteredUsers = async () => {
  try {
    const response = await apiClient.get("/registered_users");
    return response.data; // List of user_ids
  } catch (error) {
    console.error(
      "Error fetching registered users:",
      error.response ? error.response.data : error.message
    );
    throw error.response
      ? error.response.data
      : new Error("Network error or server unavailable");
  }
};
