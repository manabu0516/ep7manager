
//https://discord.com/api/oauth2/authorize?client_id=1035058107899981854&permissions=2048&scope=applications.commands%20bot

const initializeDiscord = (token) => {
    const Discord = require("discord.js");
    
    const client = new Discord.Client({
        intents: 0
    });

    const handler = {};
    const instance = {};

    instance.on = (command, hander) => {
        handler[command] = hander;
    };
    instance._client = client;

    const embdedMessage = () => new Discord.EmbedBuilder().setFooter({ text: "©️fmnb0516 | ep7manager"}).setTimestamp();

    client.on("interactionCreate", async (interaction) => {
        if (interaction.isCommand() === false) {
            return;
        }

        const commandName = interaction.commandName;
        const commandInvoke =handler[commandName];

        const context = {
            embdedMessage : embdedMessage,
            author : interaction.member.displayName,
            guild  : interaction.guild.id,
            options: interaction.options,
            deffer : async () => await interaction.deferReply()
        };

        if(commandInvoke === undefined) {
            interaction.reply("not found command");
            return;
        }
        const result = await commandInvoke(context);

        return interaction.replied || interaction.deferred ? await interaction.followUp(result) : interaction.reply(result);
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

Array.prototype.mode = function () {
    if (this.length === 0){
        //配列の個数が0だとエラーを返す。
        throw new Error("配列の長さが0のため最頻値が計算できません");
        //nullを返しても困らない時(配列の中にnullが無い時)はnullを返すように実装しても良い。
        //return null
    }
    //回数を記録する連想配列
    var counter = {}
    //本来の値を入れた辞書
    var nativeValues = {}

    //最頻値とその出現回数を挿入する変数
    var maxCounter = 0;
    var maxValue = null;

    for (var i = 0; i < this.length; i++) {
        //counterに存在しなければ作る。keyは型を区別する
        if (!counter[this[i] + "_" + typeof this[i]]) {
            counter[this[i] + "_" + typeof this[i]] = 0;
        }
        counter[this[i] + "_" + typeof this[i]]++;
        nativeValues[this[i] + "_" + typeof this[i]] = this[i];

    }
    for (var j = 0; j < Object.keys(counter).length; j++) {
        key = Object.keys(counter)[j];
        if (counter[key] > maxCounter) {
            maxCounter = counter[key];
            maxValue = nativeValues[key]
        }
    }
    return maxValue

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
    const tesseract = require("tesseract.js");
    const tesseract_ocr = require("node-tesseract-ocr");
    const sharp = require("sharp");

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
                tesseract : tesseract,
                tesseract_ocr : tesseract_ocr,
                sharp : sharp,
                fs : fs
            },
            discord : discordManager,
            twitter : twitterManager,
            logger  : (message, parameter) => {
                const dateStr = new Date() + "";
                const paramStr = JSON.stringify(parameter, null , "\t");

                const fmtMessage = "[" + dateStr + "] [" + target + "] " + message + " :" + paramStr;
                console.log(fmtMessage);
                return fmtMessage;
            },
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