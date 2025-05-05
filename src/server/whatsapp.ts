import { Buttons, Client, LocalAuth } from "whatsapp-web.js";
import path from "path";
import fs from "fs";

const authPath = path.join(__dirname, "..", "..", ".whatsapp");

if (!fs.existsSync(authPath)) {
  console.log("Creating whatsapp auth path");
  fs.mkdirSync(authPath);
}

const authStrategy = new LocalAuth({ dataPath: authPath });

const puppeteerOptions = {
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-extensions"],
};

var clientProps: any = {
  authStrategy,
  webVerssionCache: { type: "none" },
  // webVersionCache: {
  //   type: "remote",
  //   remotePath:
  //     "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  // },
};

if (process.env.NODE_ENV === "production") {
  clientProps.puppeteer = puppeteerOptions;
}

const whatsapp = new Client(clientProps);

export { whatsapp };

export enum WhatsAppEvents {
  MESSAGE = "message",
  QR_RECEIVED = "qr",
  READY = "ready",
}
