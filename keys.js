"use strict";

const fs = require("fs");
const path = require("path");

function getPrivateKey()
{
    return fs.readFileSync(path.resolve(__dirname, "private_key.pem"), "utf8");
}

function getPublicKey()
{
    return fs.readFileSync(path.resolve(__dirname, "public_key.pem"), "utf8");
}

class JWTKeyPair
{
    constructor() // its big brain time
    {
        return (async () => {
            [this.private, this.public] = await Promise.all([getPrivateKey(), getPublicKey()]);
            return this;
        })();
    }

}

// var keys = (async _ => {return await new JWTKeyPair()})();
let keys = null;

module.exports = { keys, JWTKeyPair };