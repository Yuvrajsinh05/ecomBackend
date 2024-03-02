const router = require("express").Router()
const CategoriesSchema = require('../Schema/Categories')
const { Client, Events, GatewayIntentBits } = require('discord.js')

const {io} = require('../index')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const client2 = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.login(process.env.DISCORDBOT)







router.post('/sendMessage', async (req, res) => {
  try {
    // console.log("reqcustomer",)
    const userMessage = req.body.Message;
    const channel = client.channels.cache.get(process.env.CHANNELID)
    if (channel) {
      await channel.send({
        content: `USER ${req?.customer.userID} SAYING ${userMessage}`,
      });
 
      return res.status(200).json({ message: "MSG SENT TO THE DISCORD" });
    } else {
      return res.status(404).json({ message: "Channel not found" });
    }
  } catch (err) {
    console.log()
    return res.status(200).json({ message: "Failing To Interact" })
  }
});




module.exports = router;