import inquirer from "inquirer";
import select, { Separator } from "@inquirer/select";
import autocomplete from "inquirer-autocomplete-standalone";
import input from "@inquirer/input";
import { listCollections } from "./collection.js";
import chalk from "chalk";
import { homedir } from "os";
import * as fs from "fs";
import { execSync, spawn } from "child_process";
import axios from "axios";
import { getToken } from "./auth.js";
import { v4 as uuidv4 } from "uuid";
import { cwd } from "process";

const linuxConfigDir = `${homedir}/.config/envstash`;

const encrypt = async (name: string, value: string) => {
  const tempFileName = `${linuxConfigDir}/${name}.tmp`;
  const encFileName = `${linuxConfigDir}/${name}.enc`;
  // identity is -i linuxConfigDir/envstash_private_key
  // create file with string as value and no extension
  fs.writeFileSync(`${linuxConfigDir}/${name}.tmp`, value, "utf8");
  const age = execSync(
    `age -e -a -i ${linuxConfigDir}/envstash_private_key -o ${encFileName} ${tempFileName}`
  );
  return age;
  // encrypt file with age, name it as random string .tmp
  // on close, read the file and return the value
  // use age multiple recipients so that people in the team can decrypt it as well
};

const decrypt = async (value: string) => {
  const tempFileName = uuidv4();
  // create temp file w enc data
  fs.writeFileSync(`${linuxConfigDir}/${tempFileName}.enc`, value, "utf8");
  // decrypt using default age key to file
  execSync(
    `age --decrypt -i ${linuxConfigDir}/envstash_private_key ${linuxConfigDir}/${tempFileName}.enc > ${linuxConfigDir}/${tempFileName}.tmp`
  );
  return {
    fileName: `${linuxConfigDir}/${tempFileName}.tmp`,
    encFileName: `${linuxConfigDir}/${tempFileName}.enc`,
  };
  // export it to env/operate on value in another function
};

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
  const userCredentials = await getToken();
  if (typeof userCredentials !== "boolean") {
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
                value: value.id,
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
        // TODO: add team condition for recipients
        // encrypt variable and send string value to api
        const encFileName = `${linuxConfigDir}/${variableName}.enc`;
        const tempFileName = `${linuxConfigDir}/${variableName}.tmp`;
        encrypt(variableName, variableValue);
        const fileResult = fs.readFileSync(encFileName, "utf8");
        if (fileResult) {
          // send to db
          try {
            fs.rmSync(encFileName);
            fs.rmSync(tempFileName);
            const { data } = await axios.post(
              "http://localhost:3000/variable/create",
              {
                name: variableName,
                encValue: fileResult,
                firstFourChars: "TEST",
                collectionId,
              },
              {
                headers: {
                  Authorization: `Bearer ${userCredentials.access_token}`,
                },
              }
            );
            console.log(
              `Your variable ${chalk.bold(
                data.variable.name
              )} was created! Retrieve it with ${chalk.bold(
                `envs var import [collection] [variable_name]`
              )}.`
            );
            return;
          } catch (error) {
            console.error("Unable to create variable", error);
            return;
          }
        }
      } catch (error) {
        console.error("Unable to create variable", error);
        return;
      }
    }
  } else {
    console.log("Not logged in");
  }
};

export const getVariable = async (
  collectionName: string,
  variableName: string,
  fromCollection: boolean
) => {
  const userCredentials = await getToken();
  if (typeof userCredentials !== "boolean") {
    const { data: collectionRequest } = await axios.get(
      `http://localhost:3000/collection/${collectionName}`,
      {
        headers: {
          Authorization: `Bearer ${userCredentials.access_token}`,
        },
      }
    );
    const { data: variableRequest } = await axios.get(
      `http://localhost:3000/variable/${variableName}?collectionId=${collectionRequest.collection.id}`,
      {
        headers: {
          Authorization: `Bearer ${userCredentials.access_token}`,
        },
      }
    );
    // console.log(variableRequest);
    const { fileName, encFileName } = await decrypt(
      variableRequest.encryptedValue
    );
    const decryptedValue = fs.readFileSync(fileName, "utf8");
    fs.rmSync(fileName);
    fs.rmSync(encFileName);
    if (!fromCollection) {
      fs.writeFileSync(`${cwd()}/.env`, `${variableName}="${decryptedValue}"`);
      const exportCommand = `echo "export ${variableName}=${decryptedValue}" >> ~/.zshrc && source ~/.zshrc && rm -- "$0"`;
      console.log(
        `Your variable ${chalk.bold(
          variableName
        )} was successfully added to a .env file in your current working directory.\n`
      );
      console.log(
        `By default, the Envstash process can't access your current shell, so to add the variables to your system environment, run this command:\n`
      );
      console.log(`${chalk.bold(exportCommand)}\n`);
      return;
    }
    // find a way to export it to env
  } else {
    console.log("Not logged in");
  }
};
