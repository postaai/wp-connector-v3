import axios from "axios";
import environment from "../config/enviornment";

const env = environment();

const apiUrl = env.AUDIO_PROCESSOR_API_URL;

const api = axios.create({ baseURL: apiUrl });

type AudioToTextResponse = {
  text: string;
};

export const postTranscript = async (audio: File, orgid: string) => {
  const formData = new FormData();
  formData.append("audio", audio);

  try {
    const response = await api.post<AudioToTextResponse>(
      "/transcript",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          orgid,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading audio file:", error);
    throw error;
  }
};
