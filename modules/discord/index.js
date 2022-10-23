
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

    builder.addEvt("app.initialize", async (application) => {
        const wikidata = application.wikidata;
        const ocrreader = application.ocrreader;
        const tweetsearch = application.tweetsearch;

        parameter.discord.on("readme", async (context, params) => {

            const build_cmd = context.embdedMessage()
                .setTitle('build')
                .setDescription(
                    [
                        "パラメータで指定された英雄の装備画像を表示します",
                        "usage : @[bot-name] buld [英雄名] [ページ番号]"
                    ].join("\r\n")
                )
                .addFields([
                    { name: '[英雄名]', value: "装備画像を表示したい英雄の名前を入力します" ,inline: false},
                ])
                .addFields([
                    { name: '[ページ番号]', value: "表示するページを指定します\r\n未指定の場合は1ページ目を表示" ,inline: false},
                ]);

            const st_cmd = context.embdedMessage()
                .setTitle('st')
                .setDescription(
                    [
                        "パラメータで指定された英雄のステータス画像を表示します",
                        "usage : @[bot-name] st [英雄名]"
                    ].join("\r\n")
                )
                .addFields([
                    { name: '[英雄名]', value: "ステータスを表示したい英雄の名前を入力します" ,inline: false},
                ]);

            const upload_cmd = context.embdedMessage()
                .setTitle('upload')
                .setDescription(
                    [
                        "英雄のビルド画像をTwitterにアップロードします。",
                        "※アップロード先のアカウントは本BOTの管理アカウントになります。",
                        "※アップロード時にDiscordのサーバ名とユーザ名も併せて投稿されます。",
                        "※添付ファイルの指定は必ず必要になります。",
                        "usage : @[bot-name] upload [任意のコメント]"
                    ].join("\r\n")
                )
                .addFields([
                    { name: '[任意のコメント]', value: "ツイートに含めたい文言を設定します(任意)" ,inline: false},
                    { name: '[添付ファイル]', value: "投稿する英雄のステータス画面を添付してください" ,inline: false},
                ]);

            return [build_cmd, st_cmd, upload_cmd];
        });

        parameter.discord.on("score", async (context, params) => {
            try {
                logger("score cmd --- start", params);

                const heroName = await wikidata.callApi('normalize', [params[0], false]);
                if(context.attachment === undefined) {
                    logger("score cmd --- end :nf");
                    return 'not found image';
                }

                const response = await parameter.lib.request(context.attachment.url, {encoding: null});
                const result = await ocrreader.callApi("recognize", [response]);
                const heroData = await wikidata.callApi("load", [heroName]);

                const statusData = heroData != null ? {
                    "攻撃力" : heroData["ステータス"]["攻撃力"]["最大値"],
                    "生命力" : heroData["ステータス"]["生命力"]["最大値"],
                    "防御力" : heroData["ステータス"]["防御力"]["最大値"]
                } : undefined;

                const score = await target.callApi("score", [result, statusData]);

                const enbded = context.embdedMessage()
                    .setTitle("スコア:" + score.score);

                const fields = score.resultData.map(entry => {
                    return  { name: entry["key"], value: entry["value"] + " => " + entry["score"],inline: true};
                });
                enbded.addFields(fields);

                logger("score cmd --- end", {
                    guild : context.guild,
                    author : context.author
                });
                return enbded;
            } catch(e) {
                return logger("error", e);
            }
        });

        parameter.discord.on("build", async (context, params) => {
            try {
                logger("build cmd --- start", params);

                const heroName = await wikidata.callApi('normalize', [params[0], false]);
                const pageNo = getPageNo(params[1]);
                const data = await tweetsearch.callApi('get', [heroName]);

                if(data.length == 0) {
                    return heroName + 'のデータは存在しません';
                }
                const sliced = splitArray(data, 3);
                const target = sliced[pageNo-1];

                if(target === undefined || target === null) {
                    return pageNo + 'ページ目の' + heroName + 'のデータは存在しません'; 
                }

                const pageMax = sliced.length;
                const result = target.map((e,i) => {
                    const pageLabel = pageNo+'/'+pageMax+'ページ';
                    const countLabel = (i+1) + '件目'
                    return  context.embdedMessage().setTitle(heroName +' '+ countLabel +' '+ pageLabel).setImage(e);
                });

                logger("build cmd --- end", {
                    guild : context.guild,
                    author : context.author
                });

                return result;
            } catch(e) {
                return logger("error", e);
            }
        });

        parameter.discord.on("upload", async (context, params) => {
            try {
                logger("upload cmd --- start", params);

                if(context.attachment === undefined) {
                    logger("upload cmd --- end :nf");
                    return 'not found image';
                }
                const tweetText = ["#ep7build #エピックセブン", 'post by : [' + context.guild + ']' + context.author].join("\r\n") + params.join(" ");
                const response = await parameter.lib.request(context.attachment.url, {encoding: null});
                const tweetResult = await parameter.twitter.tweet(tweetText, response);

                logger("upload cmd --- end", {
                    guild : context.guild,
                    author : context.author
                });
                return tweetResult.text;
            } catch(e) {
                return logger("error", e);
            }
        });

        parameter.discord.on("st", async (context, params) => {
            try {
                logger("st cmd --- start", params);

                const heroName = await wikidata.callApi('normalize', [params[0], false]);
                const data = await wikidata.callApi('load', [heroName, false]);

                const enbded = context.embdedMessage()
                    .setTitle(data["共通"]["名前"])
                    .setURL('https://manabu0516.github.io/wikidata/index.html#'+heroName)
                    .setThumbnail(data["画像"])
                    .setDescription(data["共通"]["レアリティ"] +' '+ data["共通"]["属性"] +' '+ data["共通"]["職業"])
                    .addFields([
                        { name: '攻撃力', value: data["ステータス"]["攻撃力"]["最大値"] ,inline: true},
                        { name: '生命力', value: data["ステータス"]["生命力"]["最大値"] ,inline: true},
                        { name: 'スピード', value: data["ステータス"]["スピード"]["最大値"] ,inline: true},
                        { name: '防御力', value: data["ステータス"]["防御力"]["最大値"] ,inline: true},
                        { name: 'クリティカル発生率', value: data["ステータス"]["クリティカル発生率"]["最大値"] ,inline: true},
                        { name: 'クリティカルダメージ', value: data["ステータス"]["クリティカルダメージ"]["最大値"] ,inline: true},
                        { name: '効果命中率', value: data["ステータス"]["効果命中率"]["最大値"] ,inline: true},
                        { name: '効果低効率', value: data["ステータス"]["効果命中率DOWN"]["最大値"] ,inline: true},
                        { name: '連携攻撃率', value: data["ステータス"]["連続攻撃発生率"]["最大値"] ,inline: true},

                        { name: data["スキル"][0]["スキル名"], value: skillDesc(data["スキル"][0])},
                        { name: data["スキル"][1]["スキル名"], value: skillDesc(data["スキル"][1])},
                        { name: data["スキル"][2]["スキル名"], value: skillDesc(data["スキル"][2])}
                    ])
                    .setImage(data["画像"]);

                logger("st cmd --- end", {
                    guild : context.guild,
                    author : context.author
                });
                return [enbded];
            } catch(e) {
                return logger("error", e);
            }
            
        });
        
    });

    return builder;
};