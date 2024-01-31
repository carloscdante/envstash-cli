import chalk from "chalk";
import { getToken } from "./auth.js"
import axios from 'axios';

import Table from 'cli-table3';

const log = console.log;

type Collection = {
  id: string,
  createdAt: string,
  updatedAt: string,
  content: string,
  published: boolean,
  ownerId: string,
  teamId?: string | null
}

export const list = async () => {
  const userCredentials = await getToken();
  const table = new Table({
    head: ['NAME', 'TEAM', 'LAST UPDATE', 'POPULATED']
  , colWidths: [18, 18, 26, 11]
  });
  // request api for collections
  if (typeof userCredentials !== 'boolean') {
    try {
      const { data } = await axios.get('http://localhost:3000/collection/list', {
        headers: {
          Authorization: `Bearer ${userCredentials.access_token}`
        }
      })
      if (data) {
        data.collections.map((collection: Collection) => {
          table.push([collection.content, collection.teamId, collection.updatedAt, collection.published]);
        });
        log(table.toString());
      }
    } catch (error) {
      log(`${chalk.red(`Unknown error: Couldn't get your account collections.`)}\n${error}`);
    }
  }
}

export const create = async (name: string) => {
  const userCredentials = await getToken();
  if (typeof userCredentials !== 'boolean') {
    try {
      const { data, status } = await axios.post('http://localhost:3000/collection/create', {
        content: name
      }, {
        headers: {
          Authorization: `Bearer ${userCredentials.access_token}`
        }
      })

      const collection = data.collection as Collection
      if (status == 200 && collection) {
        log(`${chalk.bold(`Your collection was created!`)}\nStart using it by adding new environment variables:\n\n${chalk.bold(`envs var add ${collection.content} [VARIABLE_NAME] [VARIABLE_VALUE]\n\n`)}`);
        return;
      }
      log(`${chalk.red(`Unknown error: Couldn't create collection.`)}\n${data}`);
    } catch (error) {
      log(`${chalk.red(`Unknown error: Couldn't create collection.`)}\n${error}`);
    }
  }
}