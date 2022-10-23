import fs from "fs";
import { createRequire } from "module";

export const saveObject = (object, path, callback) => {
  fs.writeFile(path, JSON.stringify(object, null, 2), {}, callback);
};

export const getObject = (path, defaultValue) => {
  let result = defaultValue;

  try {
    fs.statSync(path);
  } catch (error) {
    console.log(`${path} file does not exist.`);
  }

  try {
    const require = createRequire(import.meta.url);
    result = require(path);
  } catch (error) {
    console.log(`Invalid ${path} file. ${error}`);
  }

  return result;
};
