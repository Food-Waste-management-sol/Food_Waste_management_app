import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080", // Apne backend ka URL yahan check kar lena
});

// Request interceptor: Har request se pehle token add karega
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth APIs
export const login = (formData) => API.post("/auth/login", formData);
export const register = (formData) => API.post("/auth/register", formData);

// Food APIs
export const addFood = (foodData) => API.post("/food/add", foodData);
export const getAvailableFood = () => API.get("/food/available");

// Request APIs
export const createFoodRequest = (foodId) =>
  API.post(`/request/create/${foodId}`);
export const approveFoodRequest = (requestId) =>
  API.post(`/request/approve/${requestId}`);

export default API;
