import chalk from "chalk";
import { getToken } from "./auth.js";
import axios from "axios";

import Table from "cli-table3";
import { getVariable } from "./variable.js";

const log = console.log;

type Collection = {
  id: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  published: boolean;
  ownerId: string;
  teamId?: string | null;
};

export const listCollections = async (logTable: boolean) => {
  const userCredentials = await getToken();
  const table = new Table({
    head: ["NAME", "TEAM", "LAST UPDATE", "POPULATED"],
    colWidths: [18, 18, 26, 11],
  });
  // request api for collections
  if (typeof userCredentials !== "boolean") {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/collection/list",
        {
          headers: {
            Authorization: `Bearer ${userCredentials.access_token}`,
          },
        }
      );
      if (data) {
        data.collections.map((collection: Collection) => {
          table.push([
            collection.content,
            collection.teamId,
            collection.updatedAt,
            collection.published,
          ]);
        });
        if (logTable) log(table.toString());
        return data.collections;
      }
    } catch (error) {
      log(
        `${chalk.red(
          `Unknown error: Couldn't get your account collections.`
        )}\n${error}`
      );
    }
  }
  return [];
};

export const create = async (name: string) => {
  const userCredentials = await getToken();
  if (typeof userCredentials !== "boolean") {
    try {
      const { data, status } = await axios.post(
        "http://localhost:3000/collection/create",
        {
          content: name,
        },
        {
          headers: {
            Authorization: `Bearer ${userCredentials.access_token}`,
          },
        }
      );

      const collection = data.collection as Collection;
      if (status == 200 && collection) {
        log(
          `${chalk.bold(
            `Your collection was created!`
          )}\nStart using it by adding new environment variables:\n\n${chalk.bold(
            `envs var add ${collection.content} [VARIABLE_NAME] [VARIABLE_VALUE]\n\n`
          )}`
        );
        return;
      }
      log(
        `${chalk.red(`Unknown error: Couldn't create collection.`)}\n${data}`
      );
    } catch (error) {
      log(
        `${chalk.red(`Unknown error: Couldn't create collection.`)}\n${error}`
      );
    }
  }
};

export const importVariables = async (name: string) => {
  const userCredentials = await getToken();
  if (typeof userCredentials !== "boolean") {
    try {
      const { data: collectionRequest } = await axios.get(
        `http://localhost:3000/collection/${name}`,
        {
          headers: {
            Authorization: `Bearer ${userCredentials.access_token}`,
          },
        }
      );
      await Promise.allSettled(
        collectionRequest.collection.variables.map(
          async (variable: Record<string, any>) => {
            await getVariable(name, variable.name, true);
          }
        )
      );
      log(
        `\nYour collection "${chalk.bold(
          name
        )}" was successfully added to a .env file in your current working directory.\n`
      );
      log(
        `By default, the Envstash process can't access your current shell, so to add the variables to your system environment, run this command:\n`
      );
    } catch (error) {
      console.log(
        chalk.red(
          "Error getting one or more variables from the collection.",
          error
        )
      );
    }
  } else {
    console.log("Not logged in");
  }
};
