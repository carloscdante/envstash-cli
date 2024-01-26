var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
import open from 'open';
import chalk from 'chalk';
import figlet from "figlet";
const log = console.log;
const defaultAuthDomain = 'dev-ibxprky4yw1czvgd.us.auth0.com';
const clientId = '8vYtW08XChTFpbMVXY0M764E4EXEqS0u';
let pollAuthCounter = 0;
const options = {
    method: 'POST',
    url: `https://${defaultAuthDomain}/oauth/device/code`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: { client_id: clientId, scope: 'read' }
};
const deviceCodeOptions = (deviceCode) => {
    return {
        method: 'POST',
        url: `https://${defaultAuthDomain}/oauth/token`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            device_code: deviceCode,
            client_id: clientId
        })
    };
};
const pollForAuthUpdate = (deviceCode) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios.request(deviceCodeOptions(deviceCode));
        figlet.text("Envstash", {
            font: "Standard",
        }, function (err, data) {
            // save credentials to a file on the home folder
            log(`\n${data}`);
            log(`${chalk.bold('Success! You are logged in to Envstash!')}
Your credentials were saved to your home folder.`);
        });
        return data;
    }
    catch (error) {
        if (pollAuthCounter > 5) {
            log(`${chalk.red.bold('\nUnable to sign you in because the link timed out.')}`);
            return;
        }
        pollAuthCounter++;
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () { return yield pollForAuthUpdate(deviceCode); }), 3000);
    }
});
export const authRequest = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios.request(options);
        log(`${chalk.italic(data.verification_uri_complete)}`);
        yield open(data.verification_uri_complete);
        // poll for authorization success
        const authData = yield pollForAuthUpdate(data.device_code);
        return authData;
    }
    catch (error) {
        throw error;
    }
});
//# sourceMappingURL=auth.js.map