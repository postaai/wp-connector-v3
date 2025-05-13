import "dotenv/config";
import { z } from "zod";

export const envSchema = z.object({
  SERVER_URL: z.string().min(1),
  ORG_ID: z.string().min(1),
  HTTP_PORT:z.string().min(1),
  CONTACTS_TO_SEND_SUMARY: z.string().min(1),
  AUDIO_PROCESSOR_API_URL: z.string().min(1),
});

export default function environment() {
  const parsedEnv = envSchema.safeParse(process.env);

  if (!parsedEnv.success) {
    console.error("Invalid environment variables:", parsedEnv.error.format());
    throw new Error("Invalid environment variables");
  }
  const env = parsedEnv.data;

  return env;
}
