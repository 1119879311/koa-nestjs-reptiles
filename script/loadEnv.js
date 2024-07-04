"use strict";
const dotenv = require("dotenv");
const fs = require("fs");
const nodePath = require("path");

module.exports = (options)=>{
    const NODE_ENV = process.env.NODE_ENV;
    const {rootDir,path,defaultName=".default"} = options || {};
    try {
        var newPath = "";
        if (path) {
            newPath = path;
        }
        else if (rootDir) {
            newPath = nodePath.resolve(process.cwd(), rootDir, ".env.".concat(NODE_ENV));
        }
        else {
            newPath = nodePath.resolve(process.cwd(), ".env".concat(defaultName));
        }

        if (fs.existsSync(newPath)) {
            dotenv.config({ path: newPath });
        }
    }
    catch (error) {
        console.log("loadEnv error",error.message)
    }
}
