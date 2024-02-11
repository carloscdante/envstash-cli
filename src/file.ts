import * as fs from "fs";
import { cwd } from "process";

const validateEnvFile = async (buffer: string) => {
  // names should be no longer than 128 characters
  // values should be no longer than 512 characters
  const desiredLineFormat = new RegExp(".{0,128}=.{0,512}");
  // ignore invalid
  const lines = buffer.split("\n");
  const validLines = lines.filter((value) => desiredLineFormat.exec(value));
  const offendingLines = lines.filter(
    (value) => !desiredLineFormat.exec(value),
  );
  return {
    isValid: validLines.length === lines.length,
    offendingLines,
    lines,
  };
};
export const getEnvFileAndRead = async () => {
  const file = fs.readFileSync(`${cwd()}/.env`, "utf8");
  const { isValid, offendingLines, lines } = await validateEnvFile(file);
  if (!isValid)
    throw new Error(
      `The .env file provided has an invalid format - offending lines: ${offendingLines}`,
    );

  return lines;
};
