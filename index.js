const express = require('express')
const { Server, Socket } = require('socket.io');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

require("dotenv").config();
require('./config')

const { CategoriesRoutes, ProductsRoutes, AuthUser, customer, PaymentGateway, ChatBotSocket, ServerComponent } = require("./routes/router")
const { verifyToken } = require('./middlewares/security')
const { Client , GatewayIntentBits } = require('discord.js');
const app = express()
app.set('trust proxy', true);
// console.log("app",app)
const server = http.createServer(app);

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });


app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json())
app.use(cors())
app.use(verifyToken)

app.use("/admin", AuthUser);
app.use("/admin", CategoriesRoutes);
app.use("/admin", PaymentGateway);
app.use("/admin", ProductsRoutes);
app.use("/admin", customer);
app.use("/admin", ChatBotSocket);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const client2 = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.login(process.env.DISCORDBOT)
client2.login(process.env.DISCORDBOT2)


const io = new Server(server, {
  cors: {
    origin: process.env.LOCALCLIENT,
    methods: ["GET", "POST"]
  }
})

console.log("ioCONNNECT IO",io  , process.env.LOCALCLIENT)

const io2 = new Server(server, {
  cors: {
    origin: process.env.ADMINON,
    methods: ["GET", "POST"]
  }
})


io.once('connection', async (socket) => { 
  console.log("socketID connected", socket.id)
  try {
    client.removeAllListeners("messageCreate"); 
    client.on("messageCreate", async (message) => {
      if (message.author.bot) return;
      const messageId = message?.reference?.messageId;
      if(!messageId) return;
      const channel = await client.channels.fetch(process.env.CHANNELID)
      const fetchMessages = await channel.messages.fetch(messageId)
      const mentiondMessage = fetchMessages.content
      const SocketID = mentiondMessage.slice(5, 25);
      console.log("cilent...........", mentiondMessage)
      const MessageToSocket = message.content
      const targetSocket = io.sockets.sockets.get(SocketID);
      if (targetSocket) {
        targetSocket.emit('reply', { MessageToSocket, SocketID });
      } else {
        console.log(`Socket with ID ${SocketID} not found.`);
      }
    });
  } catch (error) {
    console.error("Error fetching channel or messages:", error);
  }
});



io2.on('connection',async(socket)=>{
  
 try{
  console.log("Admin Connected",socket.id)
  client2.on('messageCreate',async(message)=>{
    console.log("message",message.content)
    const channel = await client2.channels.fetch(process.env.CHANNELACCESSLOGG)
    const fetchMessages = await channel.messages.fetch({limit:50})
    const logscontent = fetchMessages.map((mess)=> mess.content ) 
    // console.log("logscontent",socket.id,logscontent)
    socket.emit('onRecentLog',logscontent)
})

 }catch(err){
  console.log("Something Wrong With Admin")
 }
})


client.on("ready", () => {
  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  );
  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});
client2.on("ready", () => {
  console.log(
    `Bot 2 has started, with ${client2.users.cache.size} users, in ${client2.channels.cache.size} channels of ${client2.guilds.cache.size} guilds.`
  );
  client2.user.setActivity(`Serving ${client2.guilds.cache.size} servers`);
});





const PORT = process.env.PORT || 8670;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});