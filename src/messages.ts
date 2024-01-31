import chalk from "chalk";

export const messages = {
  SUCCESS_LOGIN: `${chalk.red.bold('\nUnable to sign you in because the link timed out.')}`,
} as const;