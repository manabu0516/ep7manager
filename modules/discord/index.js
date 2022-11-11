

const localeValue = (data, key, locale) => {
    const defVal = data[key];
    const localeVal = data[key+'_'+locale];
    return localeVal != undefined ? localeVal : defVal;
};

const skillDesc = (skillData, locale, localizer) => {
    const description = skillData.description;

    const text = localeValue(description, "text", locale);
    const burn = localeValue(description, "burn", locale);
    const ct = description.ct;
    const enhance = description.enhance;
    const soul = description.soul;
    const multipliers = description.multipliers;
    const contents = [];

    if(ct !== null) {
        contents.push("CT : " + ct);
    }

    if(skillData.type === 'Passive') {
        contents.push("<" + localizer.st_label_passive() + '>');
    }

    if(soul !== null) {
        contents.push(localizer.st_label_soul(soul));
    }

    contents.push(text);

    if(burn !== '') {
        contents.push(localizer.st_label_soulburn() + ': ' + burn);
    }

    if(multipliers !== null) {
        contents.push("<" + localizer.st_label_multipliers() + ': ' + multipliers + '>');
    }

    if(enhance.length > 0) {
        contents.push("---<" +localizer.st_label_enhance()+ ">---");
        contents.splice(contents.length, 0, ...enhance);
    }

    return contents.join("\r\n");
};

const getPageNo = (val) => {
    if(val === undefined || val === null) {
        return 1;
    }
    const num = parseInt(val);
    const ret = isNaN(num) ? 1 : num;
    return ret > 0 ? ret : 1;
};

const splitArray = (array, n) => {
    return array.reduce((a, c, i) => i % n == 0 ? [...a, [c]] : [...a.slice(0, -1), [...a[a.length - 1], c]], []);
};

module.exports = async (parameter) => {
    const builder = parameter.instance();
    const logger = parameter.logger;


    const localizeManager = (() => {
        const locales = {
            "en-US" : require(parameter.moduleDir + "/locale/en-US.js"),
            "zh-CN" : require(parameter.moduleDir + "/locale/zh-CN.js"),
            "ko" : require(parameter.moduleDir + "/locale/ko.js"),
            "ja" : require(parameter.moduleDir + "/locale/ja.js"),
        };

        return (locale) => {
            const data = locales[locale];
            return data !== undefined ? data : locales["en-US"];
        };
    })();

    builder.addEvt("app.initialize", async (application) => {
        const wikidata = application.wikidata;
        const ocrreader = application.ocrreader;
        const tweetsearch = application.tweetsearch;
        const infoManager = application.info;

        parameter.discord.on("ep7-info", async (context) => {
            try {
                const localizer = localizeManager(context.locale);

                const param = context.options.get("count");
                logger("ep7-info cmd start -- :start", {author : context.author,param  : [param]});

                const paramValue = param !== null ? param.value : 1;
                const infos = await infoManager.callApi("get", [paramValue]);

                const enbdeds = infos.map(e => {
                    const enbded = context.embdedMessage()
                        .setTitle(e.title)
                        .setDescription(e.description)
                        .addFields([
                            { name: localizer.info_label_1(), value: e.data ,inline: false}
                        ]);

                    return enbded;
                });

                logger("ep7-info cmd end -- :success", {author : context.author});
                return { embeds: enbdeds };
            } catch(e) {
                logger("ep7-info cmd end -- :error", {author : context.author, erroe : e+""});
                return "error : " + e;
            }
        });

        parameter.discord.on("ep7-st", async (context) => {
            try {
                const localizer = localizeManager(context.locale);
                
                const param = context.options.get("heroname");
                logger("ep7-st cmd start -- :start", {author : context.author,param  : [param]});

                const aliaseData = await wikidata.callApi('alias', [param.value, false]);
                if(aliaseData === undefined) {
                    logger("ep7-build cmd complete -- :notfound", {author : context.author, param  : [heroNameParam.value, pageNo]});
                    return localizer.build_nodfound(heroNameParam.value);
                }

                const data = await wikidata.callApi('load', [aliaseData["_name"], false]);

                const enbded = context.embdedMessage()
                    .setTitle(localeValue(data.common, "name", context.locale))
                    .setURL('https://manabu0516.github.io/wikidata/index.html#'+aliaseData["_path"])
                    .setThumbnail(data.common.image)
                    
                    .setDescription(localizer.st_label_rarity(data.common.rarity) +' '+ localizer.st_label_type(data.common.attribute) +' '+ localizer.st_label_clazz(data.common.clazz))
                    .addFields([
                        { name: localizer.st_attack(), value: data.statusData.Atk ,inline: true},
                        { name: localizer.st_health(), value: data.statusData.HP ,inline: true},
                        { name: localizer.st_speed(), value: data.statusData.Speed ,inline: true},
                        { name: localizer.st_defence(), value: data.statusData.Def ,inline: true},
                        { name: localizer.st_crt_chance(), value: data.statusData.Critical_Hit_Chance + '%',inline: true},
                        { name: localizer.st_crt_damage(), value: data.statusData.Critical_Hit_Damage + '%',inline: true},
                        { name: localizer.st_effect_hit(), value: data.statusData.Effectiveness + '%',inline: true},
                        { name: localizer.st_effect_resist(), value: data.statusData.Effect_Resistance + '%',inline: true},
                        { name: localizer.st_teameffort(), value: data.statusData.dual_attack + '%',inline: true},
                        
                        { name: localeValue(data.skills[0], "title", context.locale), value: skillDesc(data.skills[0], context.locale, localizer)},
                        { name: localeValue(data.skills[1], "title", context.locale), value: skillDesc(data.skills[1], context.locale, localizer)},
                        { name: localeValue(data.skills[2], "title", context.locale), value: skillDesc(data.skills[2], context.locale, localizer)},
                    ])
                    .setImage(data.common.image);

                logger("ep7-st cmd end -- :success", {author : context.author, name  : aliaseData});
                return { embeds: [enbded] };
            } catch(e) {
                logger("ep7-st cmd end -- :error", {author : context.author, erroe : e+""});
                return "error : " + e;
            }
            
        });

        parameter.discord.on("ep7-build", async (context, params) => {
            try {
                const localizer = localizeManager(context.locale);

                const heroNameParam = context.options.get("heroname");
                const pagenoParam = context.options.get("pageno");

                logger("ep7-build cmd start -- :start", {author : context.author,param  : [heroNameParam, pagenoParam]});

                const aliaseData = await wikidata.callApi('alias', [heroNameParam.value, false]);
                if(aliaseData === undefined) {
                    logger("ep7-build cmd complete -- :notfound", {author : context.author, param  : [heroNameParam.value, pageNo]});
                    return localizer.build_nodfound(heroNameParam.value);
                }

                const heroName = aliaseData.localize.ja;
                const pageNo = pagenoParam !== null ? getPageNo(pagenoParam.value) : 1;
                const data = await tweetsearch.callApi('get', [heroName]);

                if(data.length == 0) {
                    logger("ep7-build cmd complete -- :notfound", {author : context.author, param  : [heroName, pageNo]});
                    return localizer.build_nodfound(heroName);
                }
                const sliced = splitArray(data, 3);
                const target = sliced[pageNo-1];

                if(target === undefined || target === null) {
                    logger("ep7-build cmd complete -- :notpage", {author : context.author, param  : [heroName, pageNo]});
                    return localizer.build_notpage(pageNo,heroName); 
                }

                const dispHeroName = aliaseData.localize[context.locale] ? aliaseData.localize[context.locale] : aliaseData['_name'];

                const pageMax = sliced.length;
                const enbded = target.map((e,i) => {
                    const pageLabel = localizer.build_page_label(pageNo,pageMax);
                    const countLabel = localizer.build_count_label(i+1);
                    return  context.embdedMessage().setTitle(dispHeroName +' '+ countLabel +' '+ pageLabel).setImage(e);
                });

                logger("ep7-build cmd complete -- :success", {author : context.author, target  : target});
                return { embeds: enbded};
            } catch(e) {
                logger("ep7-build cmd end -- :error", {author : context.author, erroe : e+""});
                return "error : " + e;
            }
        });

        parameter.discord.on("ep7-score", async (context) => {
            try {
                const localizer = localizeManager(context.locale);

                const heroNameParam = context.options.get("heroname");
                const imageParam = context.options.get("image");

                logger("ep7-score cmd start -- :start", {author : context.author,param  : [imageParam, heroNameParam]});

                const aliaseData = await wikidata.callApi('alias', [heroNameParam.value, false]);
                await context.deffer();

                const heroData = aliaseData === undefined ? null : await wikidata.callApi("load", [aliaseData["_name"]]);
                const statusData = heroData != null ? {
                    "攻撃力" : parseInt(heroData.statusData.Atk),
                    "生命力" : parseInt(heroData.statusData.HP),
                    "防御力" : parseInt(heroData.statusData.Def)
                } : undefined;

                const response = await parameter.lib.request(imageParam.attachment.url, {encoding: null});
                const result = await ocrreader.callApi("recognize", [response]);

                const score = await ocrreader.callApi("score", [result, statusData]);
                const enbded = context.embdedMessage()
                    .setTitle(localizer.score_label("スコア")+": " + score.score);

                const fields = score.resultData.map(entry => {
                    return  { name: localizer.score_label(entry["key"]), value: entry["value"] + " (score: " + entry["score"] + ")",inline: false};
                });
                enbded.addFields(fields).setThumbnail(imageParam.attachment.url);
                
                logger("ep7-score cmd complete -- :success", {author : context.author, score  : score});
                return { embeds: [enbded]};
            } catch(e) {
                logger("ep7-score cmd end -- :error", {author : context.author, erroe : e+""});
                return "error : " + e;
            }
        });


        parameter.discord.on("ep7-upload", async (context, params) => {
            try {
                const localizer = localizeManager(context.locale);

                const imageParam = context.options.get("image");
                const commentParam =  context.options.get("comment");

                logger("ep7-upload cmd start -- :start", {author : context.author,param  : [imageParam, commentParam]});

                const comment = commentParam != null ? commentParam : "";
                await context.deffer();

                const tweetText = [localizer.upload_tweetText(), 'post by : [' + context.guild + ']' + context.author].join("\r\n") + comment;
                const response = await parameter.lib.request(imageParam.attachment.url, {encoding: null});
                const tweetResult = await parameter.twitter.tweet(tweetText, response);

                logger("ep7-build cmd complete -- :success", {author : context.author, param  : [tweetResult.text]});
                return tweetResult.text;
            } catch(e) {
                logger("ep7-upload cmd end -- :error", {author : context.author, erroe : e+""});
                return "error : " + e;
            }
        });
    });
    return builder;
};