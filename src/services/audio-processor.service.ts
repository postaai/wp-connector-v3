import { Message } from "whatsapp-web.js";
import fs from "fs";
import path, { resolve } from "path";
import { postTranscript } from "../api/autio-processor";

const getMediaDirectory = () => {
  const mediaDirectory = path.join(__dirname, "..", "media");
  if (!fs.existsSync(mediaDirectory)) {
    fs.mkdirSync(mediaDirectory);
  }
  return mediaDirectory;
};

export const handleReciveVoiceMessage = async (
  message: Message,
  orgid: string
) => {
  if (message.hasMedia) {
    console.log("🎤 Recebendo áudio...");
    const media = await message.downloadMedia();
    if (media && media.mimetype.startsWith("audio")) {
      const buffer = Buffer.from(media.data, "base64");
      const filename = `stt-${Date.now()}-${message.id.id}.ogg`;

      const mediaDirectory = getMediaDirectory();

      const filePath = path.join(mediaDirectory, filename);

      fs.writeFileSync(filePath, buffer);
      console.log(`🎤 Áudio salvo em: ${filePath}`);

      const file = new File([buffer], filename, { type: media.mimetype });
      const result = await postTranscript(file, orgid);

      fs.unlinkSync(filePath);

      return result.text;
    } else {
      return "Houve uma falha ao processar o áudio.";
    }
  } else {
    return "Não foi possível processar o áudio.";
  }
};

// export const handlerSendAudio = async (
//   textMessage: string,
//   messageId: string
// ) => {
//   try {

//     console.log("transformando texto em audio ----->", textMessage);
//     const response = await textToAudio(textMessage);
//     const mediaDirectory = getMediaDirectory();
//     const fileName = `tts-${Date.now()}-${messageId}.mp3`;
//     const ttsFileName = path.join(mediaDirectory, fileName);

//     const writer = fs.createWriteStream(ttsFileName);

//     response.data.pipe(writer);

//     return new Promise((resolve, reject) => {
//       writer.on("finish",()=>{
//         console.log("Audio file created successfully ->", ttsFileName);
//         resolve(ttsFileName);
//       })
//       writer.on("error", (error) => {
//         console.error("Error writing audio file:", error);
//         reject(error);
//       });
//     });
//   } catch (error) {
//     console.error("Error generating audio:", error);
//     throw error;
//   }
// };
