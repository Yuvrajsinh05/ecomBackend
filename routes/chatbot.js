const router = require("express").Router()
const CategoriesSchema = require('../Schema/Categories')
const { Client, Events, GatewayIntentBits } = require('discord.js');
const Interaction = require("../Schema/interection");


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
// const client2 = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.login(process.env.DISCORDBOT)




router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body; // Fixing the typo in Description
    const channel = client.channels.cache.get(process.env.CHANNELID);
    if (channel) {
      await channel.send({
        content: `New Contact:\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nDescription: ${message}`,
      });
      return res.status(200).json({ message: "Message sent to the Discord channel successfully." });
    } else {
      return res.status(404).json({ message: "Discord channel not found." });
    }
  } catch (err) {
    console.error("Error sending message to Discord:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});



router.post('/sendMessage', async (req, res) => {
  try {
    const userMessage = req.body.Message;
    const { IDSock } = req.body;
    console.log("userMessageIDSock",IDSock)
    const { userID } = req.customer
    const channel = client.channels.cache.get(process.env.CHANNELID)
    if (channel) {
      await channel.send({
        content: `USER(${IDSock}) SAYING  : ${userMessage}`,
      });
      const filter = { customer_id: userID };
      const newMessage = {
        role: 'user',
        content: userMessage,
        timeStamp: new Date()
      }

      const update = {
        $push: { ActiveChat: newMessage },
        $setOnInsert: {
          replied: false,
          repliedAt: new Date()
        },
        $set: {
          recivedAt: new Date()
        }
      };


      const options = { upsert: true };

      const Action  = await Interaction.updateOne(filter, update, options);
      console.log("actions" , Action)
      return res.status(200).json({ message: "MSG SENT TO THE DISCORD" });
    } else {
      return res.status(404).json({ message: "Channel not found" });
    }
  } catch (err) {
    return res.status(200).json({ message: "Failing To Interact" })
  }
});




module.exports = router;