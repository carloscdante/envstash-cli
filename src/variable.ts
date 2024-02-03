import inquirer from "inquirer";
import select, { Separator } from "@inquirer/select";
import autocomplete from "inquirer-autocomplete-standalone";
import input from "@inquirer/input";
import { listCollections } from "./collection.js";
import chalk from "chalk";
import { homedir } from "os";
import * as fs from "fs";
import { spawn } from "child_process";

const linuxConfigDir = `${homedir}/.config/envstash`;

const encrypt = async (name: string, value: string) => {
  try {
    const tempFileName = `${linuxConfigDir}/${name}.tmp`;
    const encFileName = `${linuxConfigDir}/${name}.enc`;
    // identity is -i linuxConfigDir/envstash_private_key
    // create file with string as value and no extension
    fs.writeFileSync(`${linuxConfigDir}/${name}.tmp`, value, "utf8");
    const age = spawn("age-keygen", [
      "-e",
      "-i",
      `${linuxConfigDir}/envstash_private_key`,
      "-o",
      encFileName,
      tempFileName,
    ]);
    age.on("close", (data) => {
      const encValue = fs.readFileSync(encFileName, "utf8");
    });
  } catch (error) {
    throw "Error getting keyfile." + error;
  }
  // encrypt file with age, name it as random string .tmp
  // on close, read the file and return the value
  // use age multiple recipients so that people in the team can decrypt it as well
};

const decrypt = async () => {};

const getCollectionChoices = async () => {
  const collections = await listCollections(false);
  if (collections.length !== 0) {
    return [...collections];
  } else {
    console.log(
      `${chalk.red.bold(
        `You can't add a variable if you have no collections.`
      )}`
    );
    return false;
  }
};

export const addVariable = async () => {
  const collections = await getCollectionChoices();

  if (collections) {
    try {
      const collectionId = await autocomplete({
        message: "Which collection are you adding this variable to?",
        source: async (input) => {
          let filteredCollections = collections;
          if (input !== undefined)
            filteredCollections = collections.filter((value) =>
              value.content.includes(input)
            );
          return filteredCollections.map((value: Record<string, any>) => {
            return {
              name: value.content,
              value: value.content,
            };
          });
        },
      });
      const variableName = await input({
        message: "What will be the variable name?",
      });
      const variableValue = await input({
        message: "What will be the variable value?",
      });
      // add team condition for recipients
      console.log(collectionId, variableName, variableValue);
      // encrypt variable and send string value to api
      const encryptedValue = await encrypt(variableName, variableValue);
    } catch (error) {
      return;
    }
  }
};
