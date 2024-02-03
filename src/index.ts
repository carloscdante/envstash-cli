#! /usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import os from "os";

import { authRequest, getToken } from "./auth.js";
import { createKey, rotateKey } from "./key.js";
import { create, listCollections } from "./collection.js";
import { addVariable, getVariable } from "./variable.js";

const envstash = new Command();

const version = "0.0.1";

const key = envstash.command("key");
const collection = envstash.command("collection");
const variable = envstash.command("var");

envstash
  .name("envs")
  .description(
    "Envs is a CLI designed to interact with the Envstash service and integrate it with your local workflow."
  )
  .version(version);

envstash
  .command("login")
  .description(
    "Authenticates to an envstash instance. Defaults to https://dashboard.envstash.io"
  )
  .option("--token", "returns an access token you can reuse")
  .action(async (str, options) => {
    console.log(
      "Logging you into Envstash Cloud...\nPlease confirm it on your browser with the following url:\n"
    );
    try {
      await authRequest();
    } catch (error) {
      console.log("Unable to log you in:", error);
    }
  });

envstash
  .command("pull")
  .description(
    "Fetches an environment collection or pulls recent changes to a collection"
  )
  .argument("<collection>", "tag of the environment collection")
  .option(
    "--overwrite",
    "overwrites your current environment variables with the same name"
  )
  .option(
    "--file",
    "creates or populates a local .env file in your current working directory"
  )
  .action((str, options) => {
    console.log("This function is not yet implemented.", str, options);
  });

envstash
  .command("list")
  .description(`Lists all environments you have access to.`)
  .argument("<collection>", "tag of the environment collection")
  .option(
    "-r",
    "revision",
    "returns the environment collection revision number"
  )
  .action((str, options) => {
    console.log("This function is not yet implemented.", str, options);
  });

envstash
  .command("version")
  .description(`Shows the package version.`)
  .action((str, options) => {
    console.log(`${chalk.bold("envs")} v${version} running on ${os.arch}`);
  });

envstash
  .command("view")
  .description(`Views an environment collection's variables`)
  .argument("<collection>", "tag of the environment collection")
  .option(
    "-r",
    "revision",
    "returns the environment collection revision number"
  )
  .action((str, options) => {
    console.log("This function is not yet implemented.", str, options);
  });

envstash
  .command("use")
  .description("Selects an environment collection to run operations on")
  .argument("<collection>", "tag of the environment collection")
  .action((str, options) => {
    console.log("This function is not yet implemented.", str, options);
  });

envstash
  .command("keys")
  .description(
    "Fetches all of the keys used to encrypt and decrypt variables owned by your account"
  )
  .action((str, options) => {
    console.log("This function is not yet implemented.", str, options);
  });

envstash
  .command("key")
  .description("Get details from a key owned by your account")
  .argument("<id>", "id of the key to get details from")
  .action((str, options) => {
    console.log("This function is not yet implemented.", str, options);
  });

collection
  .command("list")
  .description("Lists the collections from your account")
  .action(async (str, options) => {
    await listCollections(true);
  });

collection
  .command("create")
  .description("Creates an environment collection in your account")
  .argument("<name>", "name of the collection to create")
  .action(async (str, options) => {
    await create(str);
  });

key
  .command("create")
  .description("Creates a new encryption key for your account")
  .action(async (str, options) => {
    await createKey();
  });

key
  .command("rotate")
  .description("Rotates the encryption key for your account")
  .action(async (str, options) => {
    await rotateKey();
  });

variable
  .command("add")
  .description("Adds a variable to a collection")
  .action(async (str, options) => {
    await addVariable();
  });

variable
  .command("import")
  .description("Imports a variable from a collection")
  .argument("<collectionName>", "name of the environment collection")
  .argument("<variableName>", "name of the variable to import")
  .action(async (str, options) => {
    await getVariable(str, options);
  });

envstash.parse();
