import axios from 'axios'

import open from 'open';

import chalk from 'chalk';

import figlet from "figlet";

const log = console.log;

const defaultAuthDomain = 'dev-ibxprky4yw1czvgd.us.auth0.com';
const clientId = '8vYtW08XChTFpbMVXY0M764E4EXEqS0u'

let pollAuthCounter = 0;

const options = {
  method: 'POST',
  url: `https://${defaultAuthDomain}/oauth/device/code`,
  headers: {'content-type': 'application/x-www-form-urlencoded'},
  data: {client_id: clientId, scope: 'read'}
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
      function (err, data) {
        // save credentials to a file on the home folder
        log(`\n${data}`);
        log(`${chalk.bold('Success! You are logged into Envstash Cloud!')}
Your credentials were saved to your home folder.`, )
      }
    );
    return data;
  } catch (error) {
    if(pollAuthCounter > 5) {
      log(`${chalk.red.bold('\nUnable to sign you in because the link timed out.')}`)
      return;
    }
    pollAuthCounter++;
    setTimeout(async () => await pollForAuthUpdate(deviceCode), 3000);
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
