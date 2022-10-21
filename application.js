
//https://discord.com/api/oauth2/authorize?client_id=1028944952660611073&permissions=3072&scope=bot

const initializeDiscord = (token) => {
    const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
    const client = new Client({intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b)});
    const handler = {};

    const instance = {};
    instance._client = client;

    instance.on = (command, hander) => {
        handler[command] = hander;
    };

    client.on("messageCreate", async message => {
        if(message.author.bot){
            return;
        }
        if (message.mentions.has(client.user.id) === false) {
            return;
        }

        const messageText = message.content;

        const parameter = messageText.split(" ").map(e => e.trim()).filter(e => e !== '');
        if(parameter.length < 2) {
            message.channel.send("Not found command : " + messageText);
            return;
        }

        const command = parameter[1];
        const invoker = handler[command];

        if(invoker === undefined || invoker === null) {
            message.channel.send("Not found command : " + command);
            return;
        }

        const embdedMessage = () => new EmbedBuilder();
        const attachment = message.attachments.first();

        const context = {
            embdedMessage : embdedMessage,
            attachment : attachment,
            author : message.author.username,
            guild  : message.guild.name
        };
        
        const result = await invoker(context, parameter.slice(2));

        message.channel.send(typeof result === 'string' ? result : { embeds: result.map(e => {
            return e.setFooter({ text: "©️fmnb0516 | ep7manager"}).setTimestamp()
        })});
    });

    client.login(token);

    return new Promise((resolve, reject) => {
        client.on("ready", () => {
            resolve(instance);
        });
    });
};

const initializeTwitter = async(auth) => {
    const Twitter = require('twitter');
    var client = new Twitter(auth);
    
    const tweet = async (message, mediaData) => {
        const status = {status: message};

        if(mediaData !== undefined) {
            const media = await client.post('media/upload', {media: mediaData});
            status.media_ids = media.media_id_string;
        }

        const response = await client.post('statuses/update', status);
        return response;
    };

    const search = async (text, context, callback) => {
        let max_id_str = context.max_id;

        for (let i = 0; i < context.maxloop; i++) {
            const tweet = await client.get('search/tweets', {
                count: 100, q : text, max_id : max_id_str
            });

            for (let i = 0; i < tweet.statuses.length; i++) {
                const element = tweet.statuses[i];
                await callback(element);
            }
            const maxId = tweet.search_metadata.next_results ? tweet.search_metadata.next_results.match(/\?max_id=(\d*)/)[1] : null
            if(maxId === undefined || maxId == null) {
                break;    
            }
            max_id_str = maxId;
        }
        return max_id_str;
    };

    return {tweet:tweet, search:search};
};

module.exports = async (includes, config) => {
    config = config ? config : {};

    /* class def start */
    class ApplicationBuilder {

        constructor() {
            this.apis = {};
            this.events = [];
        }
    
        addApi(name, callable) {
            this.apis[name] = callable;
            return this;
        }

        addEvt(name, callable) {
            this.events.push({
                name : name,
                callable : callable
            });
            return this;
        }
    
        build() {
            return {
                api : this.apis,
                events : this.events
            }
        };
    }

    class ModuleApplication {

        constructor(name, context, directries) {
            this.name = name;
            this.context = context;
            this.directries = directries;
        }

        async callApi(name, parameter) {
            const callable = this.context.api[name];
            return typeof callable === 'function' ? await callable.apply({}, parameter) : null;
        }

        async triggerEvent(name, parameter) {

            const promisses = [];
            for (let i = 0; i < this.context.events.length; i++) {
                const evt = this.context.events[i];
                if(evt.name !== name) {
                    continue;
                }
                promisses.push(evt.callable(parameter));
            }
            return await Promise.all(promisses);
        }
    }
    /* class def end */

    const configure = require('./configure');

    const cron = require('node-cron');
    const request = require('request-promise');
    const cheerio = require('cheerio');
    const express = require("express");
    const fs = require("fs").promises;

    const currentDir = __dirname;
    const moduleDir = currentDir + '/modules';    
    const moduleList = await fs.readdir(moduleDir);
    const publicDir = currentDir + '/' + 'docs';

    includes = includes == undefined ? moduleList : includes;

    const discordManager = config.discord === false ? null : await initializeDiscord(configure.discordToken);
    const twitterManager = config.twitter === false ? null : await initializeTwitter(configure.twitterToken);

    const applications = {};
    for (let i = 0; i < moduleList.length; i++) {
        const target = moduleList[i];
        if(includes.indexOf(target) == -1) {
            continue;
        }

        const initalize = moduleDir + '/' + target + '/index.js';
        m = await require(initalize)({
            moduleDir : moduleDir + '/' + target,
            publicDir : publicDir + '/' + target,
            
            lib : {
                request : request,
                cheerio : cheerio,
                fs : fs
            },
            discord : discordManager,
            twitter : twitterManager,
            cron    : cron,
            instance : () => {
                return new ApplicationBuilder();
            }
        });

        applications[target] = new ModuleApplication(target, m.build(), {
            moduleDir : moduleDir + '/' + target,
            publicDir : publicDir + '/' + target
        });
    }
    
    const appKeys = Object.keys(applications);

    const promisses = [];
    for (let i = 0; i < appKeys.length; i++) {
        const k = appKeys[i];
        const p = applications[k].triggerEvent("app.initialize", applications);
        promisses.push(p);
    }
    await Promise.all(promisses);

    applications._context = {
        lib : {request : request,cheerio : cheerio,fs : fs}
    };

    return applications;
};