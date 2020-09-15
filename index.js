var fs = require('fs');
var GameBoyAdvance = require('gbajs');
const Discord = require('discord.js');
const bot = new Discord.Client();
const config = JSON.parse(fs.readFileSync('./config.json'));

const GBA = new GameBoyAdvance();
GBA.logLevel = GBA.LOG_ERROR;
var biosBuf = fs.readFileSync('./node_modules/gbajs/resources/bios.bin');
GBA.setBios(biosBuf);
GBA.setCanvasMemory();
GBA.loadRomFromFile('./pkmn.gba', function (err, result) {
  if (err) {
    console.error('loadRom failed:', err);
    process.exit(1);
  }
  GBA.runStable();
});
const KEYPAD = GBA.keypad;
const ACTIONS = [config.right, config.left, config.up, config.down, config.a, config.b, config.r, config.l, config.start, config.select];
let lastMessageTimestamp = Date.now();

bot.on('ready', () => {
 const guild = bot.guilds.resolve(config.serverId);

 if (guild && guild.channels.resolve(config.playChannel)) {
   let channel = guild.channels.resolve(config.playChannel);
    setInterval(() => {
      if((lastMessageTimestamp + config.delayInactivity) < Date.now()) return;
      let png = GBA.screenshot();
      let filepath = 'GBA' + Math.random(0, 100000) + '.png';
      png.pack().pipe(fs.createWriteStream(filepath));
      setTimeout(() => { channel.send({files:  ['./'+filepath]})
        .then(() => setTimeout(() => fs.unlink('./'+filepath, (err) => {
            if(err!== null) console.log('ERROR ON DELETE', err)
          })
        ), 10000)
        .catch(e => {
          console.log('ERROR', e);
          channel.send('/shrug');
        });
      }, 200);
    }, config.delayScreenshot);
 }
})	

bot.on('message', message => {
  // HELP COMMAND
  if(message.content === '::help') {
    message.reply(
      `
      -- COMMANDS --
      A :  ${config.a}
      B :  ${config.b}
      R :  ${config.r}
      L :  ${config.l}
      ↑ :  ${config.up}
      ↓ :  ${config.down}
      ← :  ${config.left}
      → :  ${config.right}
      ---------------
      `
      )
  }

  // HANDLE ACTIONS
  if ((message.channel.id === config.playChannel)) {
    if (ACTIONS.indexOf(message.content.toLocaleLowerCase()) === -1) return;
    lastMessageTimestamp = Date.now();
    switch(message.content.toLocaleLowerCase()) {
      case config.right:
        KEYPAD.press(KEYPAD.RIGHT);
        break;

      case config.left:
        KEYPAD.press(KEYPAD.LEFT);
        break;

      case config.up:
        KEYPAD.press(KEYPAD.UP);
        break;
        
      case config.down:
        KEYPAD.press(KEYPAD.DOWN);
        break;

      case config.a:
        KEYPAD.press(KEYPAD.A);
        break;
        
      case config.b:
        KEYPAD.press(KEYPAD.B);
        break;
        
      case config.start:
        KEYPAD.press(KEYPAD.START);
        break;
        
      case config.select:
        KEYPAD.press(KEYPAD.SELECT);
        break;
 
      case config.r:
        KEYPAD.press(KEYPAD.R);
        break;
       
      case config.l:
        KEYPAD.press(KEYPAD.L);
        break;
    }
  }
})

bot.login(config.token);