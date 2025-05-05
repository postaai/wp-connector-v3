import chalk from "chalk";
import { createSocketClient, SocketEvents } from "./server/socket.client";
import environment from "./config/enviornment";
import { whatsapp, WhatsAppEvents } from "./server/whatsapp";
import qrcode from "qrcode-terminal";
import {
  handleReciveBotMessage,
  handleReciveBotStopTyping,
  handleReciveBotTyping,
  handleReciveWhatsappMessage,
} from "./controllers/message.controller";

const env = environment();

const main = async () => {
  const socket = createSocketClient(env.ORG_ID);

  // Whatsapp events

  whatsapp.on(WhatsAppEvents.QR_RECEIVED, (qr) => {
    qrcode.generate(qr, { small: true });
  });

  whatsapp.on(WhatsAppEvents.READY, () => {
    console.log(chalk.green(chalk.bold("We are ready to go! 🚀")));
  });

  whatsapp.on(WhatsAppEvents.MESSAGE, (message) =>
    handleReciveWhatsappMessage(message, socket)
  );

  // Socket events

  socket.on(SocketEvents.CONNECT, () => {
    console.log(chalk.green(chalk.bold("Socket connected!")));
  });

  socket.on(SocketEvents.DISCONNECT, () => {
    console.log(chalk.red(chalk.bold("Socket disconnected!")));
  });

  socket.on(SocketEvents.BOT_MESSAGE, (message) =>
    handleReciveBotMessage(message)
  );

  socket.on(SocketEvents.BOT_TYPING, (data) => {
    handleReciveBotTyping(data);
  });
  socket.on(SocketEvents.BOT_TYPING_STOP, (data) => {
    handleReciveBotStopTyping(data);
  });

  socket.on(SocketEvents.BOT_ERROR, (error) => {
    console.error(chalk.red(chalk.bold("Bot error received:")), error);
  });

  socket.on(SocketEvents.SYSTEM_ERROR, (error) => {
    console.error(chalk.red(chalk.bold("System error received:")), error);
  });

  whatsapp.initialize().then(() => {
    console.log(`${chalk.green(chalk.bold("Whatsapp is ready! 💬"))}`);
  });
};

main()
  .then(() => {
    console.log(chalk.green(chalk.bold("App started successfully! 🚀")));
  })
  .catch((error) => {
    console.error(`${chalk.bold(chalk.red("Error starting app:"))}`, error);
  });
