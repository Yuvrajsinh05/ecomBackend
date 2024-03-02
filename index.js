const express = require('express')
const {Server, Socket} = require('socket.io');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

require("dotenv").config();
require('./config')

const {CategoriesRoutes,ProductsRoutes,AuthUser,customer,PaymentGateway, ChatBotSocket} = require("./routes/router")
const {verifyToken } = require('./middlewares/security')
const { Client, Events, GatewayIntentBits } = require('discord.js');
const app = express()
const server = http.createServer(app);

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });


app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json())
app.use(cors())
app.use(verifyToken)

app.use("/admin",AuthUser);
app.use("/admin",CategoriesRoutes);
app.use("/admin",PaymentGateway);
app.use("/admin",ProductsRoutes);
app.use("/admin",customer);
app.use("/admin",ChatBotSocket);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.login(process.env.DISCORDBOT)



const io =new Server(server,{
  cors:{
    origin:"http://localhost:3000",
    methods:["GET","POST"]
  }
})


io.on('connection',(Socket)=>{
  console.log("socketID connected",Socket.author)
  Socket.join("replyRoom")
  client.on("messageCreate",(message)=>{
    if(message.author.bot) return;
    Socket.emit('reply',message.content)
  })

})




client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("ready", () => {
  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  );
  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});




const PORT = process.env.PORT || 8670;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});