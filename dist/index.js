#! /usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Command } from 'commander';
import { authRequest } from './auth.js';
const envstash = new Command();
envstash
    .name('envs')
    .description('Environment variables made easy. This CLI is designed to interact with the Envstash service and integrate it with your local workflow.')
    .version('0.0.1');
envstash.command('login')
    .description('Authenticates to an envstash instance. Defaults to https://dashboard.envstash.io')
    .option('--token', 'returns an access token you can reuse')
    .action((str, options) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Logging you into Envstash Cloud...\nPlease confirm it on your browser with the following url:\n');
    try {
        yield authRequest();
    }
    catch (error) {
        console.log('Unable to log you in:', error);
    }
}));
envstash.command('pull')
    .description('Fetches an environment collection or pulls recent changes to a collection')
    .argument('<collection>', 'tag of the environment collection')
    .option('--overwrite', 'overwrites your current environment variables with the same name')
    .option('--file', 'creates or populates a local .env file in your current working directory')
    .action((str, options) => {
    console.log('This function is not yet implemented.', str, options);
});
envstash.command('view')
    .description(`Views an environment collection's variables`)
    .argument('<collection>', 'tag of the environment collection')
    .option('-r', 'revision', 'returns the environment collection revision number')
    .action((str, options) => {
    console.log('This function is not yet implemented.', str, options);
});
envstash.command('use')
    .description('Selects an environment collection to run operations on')
    .argument('<collection>', 'tag of the environment collection')
    .action((str, options) => {
    console.log('This function is not yet implemented.', str, options);
});
envstash.command('keys')
    .description('Fetches all of the keys used to encrypt and decrypt variables owned by your account')
    .action((str, options) => {
    console.log('This function is not yet implemented.', str, options);
});
envstash.command('key')
    .description('Get details from a key owned by your account')
    .argument('<id>', 'id of the key to get details from')
    .action((str, options) => {
    console.log('This function is not yet implemented.', str, options);
});
envstash.parse();
//# sourceMappingURL=index.js.map