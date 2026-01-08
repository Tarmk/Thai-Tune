import axios from "axios";

const getFlatApiKey = () => {
  const key = process.env.NEXT_PUBLIC_FLAT_KEY;
  if (!key) {
    console.error("NEXT_PUBLIC_FLAT_KEY is not set in environment variables");
    throw new Error("Flat.io API key is not configured");
  }
  return key;
};

const flatAxios = axios.create({
  baseURL: "https://api.flat.io/v2",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to include auth header
flatAxios.interceptors.request.use(
  (config) => {
    config.headers.Authorization = getFlatApiKey();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default flatAxios;
