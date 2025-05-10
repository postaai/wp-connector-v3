import { io } from "socket.io-client";
import environment from "../config/enviornment";
import chalk from "chalk";

const env = environment();

export const createSocketClient = (orgId: string) => {
  console.log(chalk.blue(chalk.bold("Creating socket client...")));
  const socket = io(env.SERVER_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    query: {
      orgId,
    },
  });

  return socket;
};

export enum SocketEvents {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  USER_MESSAGE = "USER_MESSAGE",
  BOT_MESSAGE = "BOT_MESSAGE",
  BOT_ERROR = "BOT_ERROR",
  BOT_TYPING = "BOT_TYPING",
  BOT_TYPING_STOP = "BOT_TYPING_STOP",
  BOT_RECORDING = "BOT_RECORDING",
  BOT_RECORDING_STOP = "BOT_RECORDING_STOP",
  SYSTEM_ERROR = "SYSTEM_ERROR",
}
