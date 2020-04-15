"use strict";

const discordBase = "https://discordapp.com/api/";

const endpoints = {
    OAuthToken: "oauth2/token",
    getCurrentUser: "users/@me"
}

module.exports = Object.keys(endpoints).reduce((acc, k) => {
    acc[k] = discordBase + endpoints[k];
    return acc;
}, {});
