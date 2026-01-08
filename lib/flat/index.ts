import flatAxios from "./flatAxios";

export async function createScore(data: any) {
  try {
    const response = await flatAxios.post("/scores", data);
    return { data: response.data, error: null };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to create score";
    const errorDetails = error.response?.data || {};
    
    // Log more details for debugging
    if (error.response?.status === 401) {
      console.error("Flat.io API authentication failed. Check NEXT_PUBLIC_FLAT_KEY in .env.local");
    }
    
    return {
      data: null,
      error: errorMessage,
    };
  }
}

export async function updateScore(scoreId: string, data: any) {
  try {
    const response = await flatAxios.put(`/scores/${scoreId}`, data);
    return { data: response.data, error: null };
  } catch (error: any) {
    console.warn("Update Score Error:", error.response?.data || error.message);
    return {
      data: null,
      error: error.response?.data?.message || "Failed to update score",
    };
  }
}
