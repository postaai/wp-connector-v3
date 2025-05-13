import { Message, MessageTypes } from "whatsapp-web.js";
import { whatsapp } from "../server/whatsapp";
import { Socket } from "socket.io-client";
import environment from "../config/enviornment";
import { SocketEvents } from "../server/socket.client";
import chalk from "chalk";
import {
  BotMessage,
  MessageSchema,
  TypingPayloadSchema,
} from "../types/message";
import { handleReciveVoiceMessage } from "../services/audio-processor.service";

const env = environment();

export const handleReciveWhatsappMessage = async (
  message: Message,
  socoket: Socket
) => {
  try {
    const isVoice = message.type === MessageTypes.VOICE;

    if (
      message.type === MessageTypes.VIDEO ||
      message.type === MessageTypes.IMAGE ||
      message.type === MessageTypes.AUDIO
    ) {
      whatsapp.sendMessage(
        message.from,
        "*Desculpe! 😔*\n\n No momento só consigo responder mensagens de texto.\nMas estamos trabalhando para melhorar cada vez mais nosso atendimento para você! 😉"
      );
      return;
    }

    const contact = await message.getContact();

    const contactName =
      contact.name ||
      contact.pushname ||
      contact.verifiedName ||
      contact.shortName ||
      "";

    const userId = message.from;
    var messageContent: string;

    if (isVoice) {
      messageContent = await handleReciveVoiceMessage(message, env.ORG_ID);
    } else {
      messageContent = message.body;
    }

    const messagePayload = {
      type: "text",
      userId,
      orgId: env.ORG_ID,
      content: messageContent,
      contactName,
      timestamp: Date.now(),
    };

    socoket.emit(SocketEvents.USER_MESSAGE, messagePayload);
    console.log(
      chalk.blue(chalk.bold("Message sent to socket:")),
      messagePayload.content
    );
  } catch (error) {
    console.error("Error handling whatsapp message:", error);
  }
};

export const handleReciveBotMessage = async (payload: BotMessage) => {
  try {
    const message = MessageSchema.safeParse(payload);

    if (!message.success) {
      console.error("Invalid message payload:", message.error.format());
      return;
    }
    const { data: messageData } = message;

    const { content, userId } = messageData;

    console.log(
      chalk.bold(
        chalk.green(`Message received to ${userId} -> `),
        chalk.bold(content)
      )
    );
    whatsapp.sendMessage(userId, content);
  } catch (error) {
    console.error("Error handling bot message:", error);
  }
};

export const handleReciveBotTyping = async (payload: BotMessage) => {
  try {
    const data = TypingPayloadSchema.safeParse(payload);
    if (!data.success) {
      console.error("Invalid typing payload:", data.error.format());
      return;
    }
    const { userId } = data.data;

    const chat = await whatsapp.getChatById(userId);

    console.log(chalk.yellow(chalk.bold("Bot started typing...")));
    await chat.sendStateTyping();

    setTimeout(() => {
      chat.clearState();
    }, 10000);
  } catch (error) {
    console.error("Error handling bot typing:", error);
  }
};

export const handleReciveBotStopTyping = async (payload: BotMessage) => {
  try {
    const data = TypingPayloadSchema.safeParse(payload);
    if (!data.success) {
      console.error("Invalid typing payload:", data.error.format());
      return;
    }
    const { userId } = data.data;

    const chat = await whatsapp.getChatById(userId);
    console.log(chalk.yellow(chalk.bold("Bot stop type...")));
    await chat.clearState();
  } catch (error) {
    console.error("Error handling bot typing:", error);
  }
};
