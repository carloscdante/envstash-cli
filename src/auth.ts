import axios from 'axios'
import open from 'open';
import chalk from 'chalk';
import figlet from "figlet";
import * as fs from 'fs';
import { homedir } from 'os';
import { messages } from './messages.js';

const log = console.log;

const defaultAuthDomain = 'dev-ibxprky4yw1czvgd.us.auth0.com';
const clientId = '8vYtW08XChTFpbMVXY0M764E4EXEqS0u';

const linuxConfigDir = `${homedir}/.config/envstash`;

type Auth = {
  access_token: string,
  refresh_token: string,
  id_token: string,
  scope: string,
  expires_in: string,
  token_type: string,
}

let pollAuthCounter = 0;

const options = {
  method: 'POST',
  url: `https://${defaultAuthDomain}/oauth/device/code`,
  headers: {'content-type': 'application/x-www-form-urlencoded'},
  data: {client_id: clientId, scope: 'openid profile email offline_access read', audience: 'https://dev-ibxprky4yw1czvgd.us.auth0.com/api/v2/'}
};

const deviceCodeOptions = (deviceCode: string) => {
  return {
    method: 'POST',
    url: `https://${defaultAuthDomain}/oauth/token`,
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    data: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      device_code: deviceCode,
      client_id: clientId
    })
  };
}

const pollForAuthUpdate = async (deviceCode: string) => {
  try {
    const { data } = await axios.request(deviceCodeOptions(deviceCode));
    figlet.text(
      "Envstash",
      {
        font: "Standard",
      },
      async (err, figletData) => {
        if (err) throw err;
        // success, save credentials to a file on the home folder
        if(!fs.existsSync(linuxConfigDir)) fs.mkdirSync(linuxConfigDir);
        fs.writeFileSync(`${linuxConfigDir}/default-credentials.json`, JSON.stringify(data, null, 2), 'utf8');
        log(`\n${figletData}`);
        log(`${chalk.bold('Success! You are logged into Envstash Cloud!')}
Your credentials were saved to your home folder.`, );
      }
    );
    return data;
  } catch (error) {
    if(pollAuthCounter > 8) {
      log(messages.SUCCESS_LOGIN)
      return;
    }
    pollAuthCounter++;
    setTimeout(async () => await pollForAuthUpdate(deviceCode), 2000);
  }
}

export const authRequest = async () => {
  try {
    const { data } = await axios.request(options);
    log(`${chalk.italic(data.verification_uri_complete)}`)
    await open(data.verification_uri_complete);
    // poll for authorization success
    const authData = await pollForAuthUpdate(data.device_code);
    return authData;
  } catch (error) {
    throw error;
  }
}

export const getToken = async (): Promise<Auth | boolean> => {
  //check if there is an existing token
  if(!fs.existsSync(linuxConfigDir)) return false;
  if(!fs.existsSync(`${linuxConfigDir}/default-credentials.json`)) return false;
  const data: string = fs.readFileSync(`${linuxConfigDir}/default-credentials.json`).toString();
  const credentials = JSON.parse(data);
  return credentials;
}