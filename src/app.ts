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
import { app } from "./server/express";
import { Sumary, SumarySchema } from "./types/sumary";
import { delay } from "./utils/delay";

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

  app.post("/send-sumary", async (req, res) => {
    try {
      const { body } = req;

      const sumaryParse = SumarySchema.safeParse(body);

      if (!sumaryParse.success) {
        return res.status(400).json({
          message: "Invalid sumary",
          error: sumaryParse.error.format(),
        });
      }
      const { data: sumaryData } = sumaryParse;

      console.log(sumaryData);

      const contactsToSendSumary = env.CONTACTS_TO_SEND_SUMARY.split(",");

      for (const contact of contactsToSendSumary) {
        const chatId = contact.trim();
        const message = `*Novo cliente encontrado*\n*Contato*:${sumaryData.userId}\n\n${sumaryData.text}`;
        await whatsapp.sendMessage(chatId, message);
      }

      if (sumaryData.userId && sumaryData.finishMessage) {
        const splitedMessage = sumaryData.finishMessage.split("[FIM_MENSAGEM]");
        const chat = await whatsapp.getChatById(sumaryData.userId);
        if (!chat) {
          return res.status(404).json({
            message: "Chat not found",
          });
        }
        for (const message of splitedMessage) {
          if (message.trim()) {
            chat.sendStateTyping();
            const delayTime = Math.min(900 + message.trim().length * 15, 3000);
            await delay(delayTime);
            await whatsapp.sendMessage(sumaryData.userId, message.trim());
            chat.clearState();
            //await whatsapp.sendMessage(sumaryData.userId, sumaryData.finishMessage);
          }
        }
      }
      return res.status(200).send({ ok: true });
    } catch (error: any) {
      return res.status(500).json({
        message: "Error sending summary",
        error: error.message,
      });
    }
  });

  app.listen(env.HTTP_PORT, () =>
    console.log(
      chalk.bold(chalk.green(`Server is running on ${env.HTTP_PORT} 🚀`))
    )
  );
};

main()
  .then(() => {
    console.log(chalk.green(chalk.bold("App started successfully! 🚀")));
  })
  .catch((error) => {
    console.error(`${chalk.bold(chalk.red("Error starting app:"))}`, error);
  });
