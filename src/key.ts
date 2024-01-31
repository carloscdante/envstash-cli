import { spawn } from 'child_process';
import { homedir } from 'os';
import * as fs from 'fs';

import chalk from 'chalk';

import figlet from "figlet";

const linuxConfigDir = `${homedir}/.config/envstash`;

// spawn age process and create a key

export const createKey = async () => {
  if(!fs.existsSync(linuxConfigDir)) fs.mkdirSync(linuxConfigDir);

  // kinda scary
  if(fs.existsSync(`${linuxConfigDir}/envstash_private_key`) && linuxConfigDir) {
    console.error(`${chalk.red.italic('You already have a saved key in your local machine!\n')}Please use the ${chalk.bold('envs rotate key')} command to rotate your encryption/decryption key.`);
    return;
  }

  const age = spawn('age-keygen', ['-o', `${linuxConfigDir}/envstash_private_key`]);

  age.stdout.on('data', (data) => {
    console.error(`Error creating personal key: ${data}`);
  });

  age.stderr.on('data', (data) => {
    console.log(`${chalk.italic(`Your key was successfully rotated!\nIt was saved to ${linuxConfigDir}/envstash_private_key\nDon't share it with anyone but people who are allowed to decrypt your secrets.\nWe won't save this key on our servers, so once it is lost, it is lost forever. Keep that in mind!`)}\n\n${data}`);
  });

  age.on('close', (code) => {
    process.exit(0);
  });
}

export const rotateKey = async () => {
  if(!fs.existsSync(linuxConfigDir)) fs.mkdirSync(linuxConfigDir);

  // kinda scary
  if(fs.existsSync(`${linuxConfigDir}/envstash_private_key`) && linuxConfigDir) fs.renameSync(`${linuxConfigDir}/envstash_private_key`, `${linuxConfigDir}/${Date.now()}_key_backup`)

  const age = spawn('age-keygen', ['-o', `${linuxConfigDir}/envstash_private_key`]);

  age.stdout.on('data', (data) => {
    console.error(`Error creating personal key: ${data}`);
  });

  age.stderr.on('data', (data) => {
    console.log(`${chalk.italic(`Your key was rotated!\nIt was saved to ${linuxConfigDir}/envstash_private_key\nDon't share it with anyone but people who are allowed to decrypt your secrets.\nWe won't save this key on our servers, so once it is lost, it is lost forever. Keep that in mind!`)}\n\n${data}`);
  });

  age.on('close', (code) => {
    process.exit(0);
  });
}