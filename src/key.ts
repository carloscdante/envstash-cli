import { spawn } from "child_process";
import { homedir } from "os";
import * as fs from "fs";

import chalk from "chalk";
import { log } from "console";
import { getToken } from "./auth.js";
import axios from "axios";

const linuxConfigDir = `${homedir}/.config/envstash`;

export const createKey = async () => {
  // save user public key on key create
  const userCredentials = await getToken();

  if (!fs.existsSync(linuxConfigDir)) fs.mkdirSync(linuxConfigDir);
  if (
    fs.existsSync(`${linuxConfigDir}/envstash_private_key`) &&
    linuxConfigDir
  ) {
    console.error(
      `${chalk.red.italic(
        "You already have a saved key in your local machine!\n"
      )}Please use the ${chalk.bold(
        "envs rotate key"
      )} command to rotate your encryption/decryption key.`
    );
    return;
  }

  const age = spawn("age-keygen", [
    "-o",
    `${linuxConfigDir}/envstash_private_key`,
  ]);

  age.stdout.on("data", (data) => {
    console.error(`Error creating personal key: ${data}`);
  });

  age.stderr.on("data", async (keyBuffer) => {
    const pubKey: string = keyBuffer.toString().split(": ")[1];
    console.log(
      `${chalk.italic(
        `Your key was successfully rotated!\nIt was saved to ${linuxConfigDir}/envstash_private_key\nDon't share it with anyone but people who are allowed to decrypt your secrets.\nWe won't save this key on our servers, so once it is lost, it is lost forever. Keep that in mind!`
      )}\n\n${keyBuffer}`
    );
    if (typeof userCredentials !== "boolean") {
      try {
        const { data } = await axios.post(
          "http://localhost:3000/user/update",
          {
            pubKey,
          },
          {
            headers: {
              Authorization: `Bearer ${userCredentials?.access_token}`,
            },
          }
        );
        if (data.updated.pubKey) console.log(chalk.blue.bold("Success!"));
        return;
      } catch (error) {
        console.log(
          `${chalk.red(
            "Error updating personal key on cloud."
          )} Please log in with ${chalk.bold("envs login")}`
        );
      }
    }
  });
};

export const rotateKey = async () => {
  // save user public key on key rotate
  const userCredentials = await getToken();

  if (!fs.existsSync(linuxConfigDir)) fs.mkdirSync(linuxConfigDir);
  if (fs.existsSync(`${linuxConfigDir}/envstash_private_key`) && linuxConfigDir)
    fs.renameSync(
      `${linuxConfigDir}/envstash_private_key`,
      `${linuxConfigDir}/${Date.now()}_key_backup`
    );

  const age = spawn("age-keygen", [
    "-o",
    `${linuxConfigDir}/envstash_private_key`,
  ]);

  age.stdout.on("data", (data) => {
    console.error(`Error creating personal key: ${data}`);
  });

  age.stderr.on("data", async (keyBuffer) => {
    const pubKey: string = keyBuffer.toString().split(": ")[1].trim();
    console.log(
      `${chalk.italic(
        `Your key was rotated!\nIt was saved to ${linuxConfigDir}/envstash_private_key\nDon't share it with anyone but people who are allowed to decrypt your secrets.\nWe won't save the private key on our servers, so once it is lost, it is lost forever.\n\nKeep that in mind!`
      )}\n\n${keyBuffer}`
    );

    console.log("Updating your public key on the cloud...");
    if (typeof userCredentials !== "boolean") {
      try {
        const { data } = await axios.post(
          "http://localhost:3000/user/update",
          {
            pubKey,
          },
          {
            headers: {
              Authorization: `Bearer ${userCredentials?.access_token}`,
            },
          }
        );
        if (data.updated.pubKey) console.log(chalk.blue.bold("Success!"));
        return;
      } catch (error) {
        console.log(
          `${chalk.red(
            "Error updating personal key on cloud."
          )} Please log in with ${chalk.bold("envs login")}`
        );
      }
    }
  });
};

export const getKey = async (): Promise<string | undefined> => {
  if (!fs.existsSync(linuxConfigDir)) fs.mkdirSync(linuxConfigDir);
  if (
    !fs.existsSync(`${linuxConfigDir}/envstash_private_key`) &&
    linuxConfigDir
  ) {
    log("Cannot find private key in storage.");
    return undefined;
  }
  const keyFile = fs.readFileSync(
    `${linuxConfigDir}/envstash_private_key`,
    "utf8"
  );
  return keyFile;
};
