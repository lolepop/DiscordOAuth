const fastify = require("fastify")();
const axios = require("axios");
const querystring = require("querystring");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const keys = require("./keys");
const api = require("./api");

fastify.get("/", (req, res) => {
    res.redirect(process.env.oauthurl);
});

fastify.get("/auth", async (req, res) => {
    let code = req.query.code;
    if (!code)
        res.send(400);
    
    var data = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: process.env.OAUTHREDIRECT,
        scope: "identify",
        code
    };

    try
    {
        let token = await axios({
            method: "POST",
            url: api.OAuthToken,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: querystring.stringify(data)
        });
        
        let userInfo = await axios({
            method: "GET",
            url: api.getCurrentUser,
            headers: {
                "Authorization": `Bearer ${token.data.access_token}`
            }
        });
        userInfo = userInfo.data;

        let authToken = await jwt.sign(
            {
                id: userInfo.id,
                name: `${userInfo.username}#${userInfo.discriminator}`
            },
            keys.keys.private,
            { algorithm: "RS256" }
        );
        
        console.log(authToken);

        res.redirect(process.env.FORMSURL + authToken);
    }
    catch (e)
    {
        console.error(e);
        res.send(400);
    }
    
});

fastify.get("/verify", (req, res) => {
    let token = req.query.token;

    jwt.verify(
        token,
        keys.keys.public,
        { algorithms: ["RS256"] },
        (err, decoded) => {
            if (err)
                res.send(400);
            else
                res.send(decoded);
        }
    );

});

(async () => {
	try 
	{
        keys.keys = await new keys.JWTKeyPair();

		await fastify.listen(process.env.PORT || 3000, "0.0.0.0");
		console.log(`Server open on port ${fastify.server.address().port}`);
	}
	catch (err)
	{
		console.error(err)
		process.exit(1);
	}

})();