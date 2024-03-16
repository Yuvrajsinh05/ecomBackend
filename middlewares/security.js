const jwt = require('jsonwebtoken')
const { Client , GatewayIntentBits } = require('discord.js');
const UserSchema = require("../Schema/User")
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.login(process.env.DISCORDBOT2)

async function verifyToken(req, res, next) {
  console.log("Calling", req.path)
  console.log("ipcalll", req.ip)

  if (req.path === '/admin/login'
    || req.path === '/admin/register'
    || req.path === '/admin/isVerifiedRegister'
    || req.path === '/admin/isGoogleLogin'
    || req.path === '/admin/isGithubLogin'
    || req.path === '/admin/isGitcallback'
    || req.path === '/admin/getclientkey'
    || req.path === '/admin/oauthclientkey'
  ) {
    return next();
  }

  let token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Verify the JWT
  jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN, async function (err, decoded) {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.customer = decoded;
    const IsUserStillExist = await UserSchema.find({ _id: decoded.userID })
    if (!IsUserStillExist[0]) {
      return res.status(500).json({ message: "Your Id Has Been Deleted!!" })
    }
    const channel = client.channels.cache.get(process.env.CHANNELACCESSLOGG)
    if (channel) {
      const logMessage = `${req.ip}/surffing/${req.path}`
      await channel.send({
        content: `USER(${IDSock}) SAYING  : ${logMessage}`,
      });}

    return next();
  });
}



module.exports = { verifyToken };


