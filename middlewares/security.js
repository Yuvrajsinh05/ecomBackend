const jwt = require('jsonwebtoken')
const { Client , GatewayIntentBits } = require('discord.js');
const UserSchema = require("../Schema/User")
const clientAccessLog = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
clientAccessLog.login(process.env.DISCORDBOT2)

clientAccessLog.on("ready", () => {
  console.log(
    `Bot has started, with ${clientAccessLog.users.cache.size} users, in ${clientAccessLog.channels.cache.size} channels of ${clientAccessLog.guilds.cache.size} guilds.`
  );
  clientAccessLog.user.setActivity(`Serving ${clientAccessLog.guilds.cache.size} servers`);
});


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
    const channel = clientAccessLog.channels.cache.get(process.env.CHANNELACCESSLOGG)
    if (channel) {
      const timeZone = 'Asia/Kolkata'; // Set to Indian Standard Time (IST)
      const currentTime = new Date().toLocaleString('en-US', { timeZone, timeZoneName: 'short' })
      const logMessage = `${req.ip}&&${req.method}&&${req.path}&&${decoded.userID}&&${currentTime}`
      await channel.send({
        content: `${logMessage}`,
      });}

    return next();
  });
}



module.exports = { verifyToken };


