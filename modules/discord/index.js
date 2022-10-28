
const skillDesc = (skill) => {
    const desc = skill["説明"].join("\r\n");

    const ext = [];
    for (let i = 0; i < skill["強化効果"].length; i++) {
        const element = skill["強化効果"][i];
        ext.push("+"+(i+1)+' ' + element);
    }
    return desc + '\r\n' + ext.join("\r\n");
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

    const localizeManager = {
        "ja_jp" : require(parameter.moduleDir + "/locale/ja_jp.js")
    };

    builder.addEvt("app.initialize", async (application) => {
        const wikidata = application.wikidata;
        const ocrreader = application.ocrreader;
        const tweetsearch = application.tweetsearch;

        parameter.discord.on("ep7-st", async (context) => {
            try {
                const localizer = localizeManager["ja_jp"];
                
                const param = context.options.get("heroname");
                logger("ep7-st cmd start -- :start", {author : context.author,param  : [param]});

                const heroName = await wikidata.callApi('normalize', [param.value, false]);
                const data = await wikidata.callApi('load', [heroName, false]);

                const enbded = context.embdedMessage()
                    .setTitle(data["共通"]["名前"])
                    .setURL('https://manabu0516.github.io/wikidata/index.html#'+heroName)
                    .setThumbnail(data["画像"])
                    .setDescription(data["共通"]["レアリティ"] +' '+ data["共通"]["属性"] +' '+ data["共通"]["職業"])
                    .addFields([
                        { name: localizer.st_attack(), value: data["ステータス"]["攻撃力"]["最大値"] ,inline: true},
                        { name: localizer.st_health(), value: data["ステータス"]["生命力"]["最大値"] ,inline: true},
                        { name: localizer.st_speed(), value: data["ステータス"]["スピード"]["最大値"] ,inline: true},
                        { name: localizer.st_defence(), value: data["ステータス"]["防御力"]["最大値"] ,inline: true},
                        { name: localizer.st_crt_chance(), value: data["ステータス"]["クリティカル発生率"]["最大値"] ,inline: true},
                        { name: localizer.st_crt_damage(), value: data["ステータス"]["クリティカルダメージ"]["最大値"] ,inline: true},
                        { name: localizer.st_effect_hit(), value: data["ステータス"]["効果命中率"]["最大値"] ,inline: true},
                        { name: localizer.st_effect_resist(), value: data["ステータス"]["効果命中率DOWN"]["最大値"] ,inline: true},
                        { name: localizer.st_teameffort(), value: data["ステータス"]["連続攻撃発生率"]["最大値"] ,inline: true},

                        { name: data["スキル"][0]["スキル名"], value: skillDesc(data["スキル"][0])},
                        { name: data["スキル"][1]["スキル名"], value: skillDesc(data["スキル"][1])},
                        { name: data["スキル"][2]["スキル名"], value: skillDesc(data["スキル"][2])}
                    ])
                    .setImage(data["画像"]);

                logger("ep7-st cmd end -- :success", {author : context.author, name  : heroName});
                return { embeds: [enbded] };
            } catch(e) {
                logger("ep7-st cmd end -- :error", {author : context.author, erroe : e+""});
                return "error : " + e;
            }
            
        });

        parameter.discord.on("ep7-build", async (context, params) => {
            try {
                const localizer = localizeManager["ja_jp"];

                const heroNameParam = context.options.get("heroname");
                const pagenoParam = context.options.get("pageno");

                logger("ep7-build cmd start -- :start", {author : context.author,param  : [heroNameParam, pagenoParam]});

                const heroName = await wikidata.callApi('normalize', [heroNameParam.value, false]);
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

                const pageMax = sliced.length;
                const enbded = target.map((e,i) => {
                    const pageLabel = localizer.build_page_label(pageNo,pageMax);
                    const countLabel = localizer.build_count_label(i+i);
                    return  context.embdedMessage().setTitle(heroName +' '+ countLabel +' '+ pageLabel).setImage(e);
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
                const localizer = localizeManager["ja_jp"];

                const heroNameParam = context.options.get("heroname");
                const imageParam = context.options.get("image");

                logger("ep7-score cmd start -- :start", {author : context.author,param  : [imageParam, heroNameParam]});

                const heroName = await wikidata.callApi('normalize', [heroNameParam !== null ? heroNameParam.value : null, false]);

                await context.deffer();

                const response = await parameter.lib.request(imageParam.attachment.url, {encoding: null});
                const result = await ocrreader.callApi("recognize", [response]);
                const heroData = await wikidata.callApi("load", [heroName]);

                const statusData = heroData != null ? {
                    "攻撃力" : heroData["ステータス"]["攻撃力"]["最大値"],
                    "生命力" : heroData["ステータス"]["生命力"]["最大値"],
                    "防御力" : heroData["ステータス"]["防御力"]["最大値"]
                } : undefined;

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
                const localizer = localizeManager["ja_jp"];

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