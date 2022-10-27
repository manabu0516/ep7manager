
const { Client, ApplicationCommandOptionType } = require("discord.js");
const commands = {};

commands ["ep7-score"] = {
    name : "ep7-score",
    description : [
        "アップロードされた装備画像のスコアを表示します",
        "β版のため精度と速度がチューニングできていないのでその点はご了承ください。"
    ].join("\r\n"),

    options : [
        {
            type: 11,
            name: "image",
            description: "スコアを計算する装備画像",
            required : true
        },
        {
            type: 3,
            name: "heroname",
            description: "実数ステの割合換算に使用する英雄の名称",
            required : false
        }
    ]
};

commands ["ep7-build"] = {
    name : "ep7-build",
    description : [
        "パラメータで指定された英雄の装備画像を表示します"
    ].join("\r\n"),

    options : [
        {
            type: 3,
            name: "heroname",
            description: "装備画像を表示したい英雄の名称",
            required : true
        },
        {
            type: 3,
            name: "pageno",
            description: "表示するページを指定します(未指定の場合は1ページ目を表示)",
            required : false
        }
    ]
};

commands ["ep7-st"] = {
    name : "ep7-st",
    description : [
        "パラメータで指定された英雄のステータスを表示します"
    ].join("\r\n"),

    options : [
        {
            type: 3,
            name: "heroname",
            description: "ステータスを表示したい英雄の名称",
            required : true
        }
    ]
};

commands ["ep7-upload"] = {
    name : "ep7-upload",
    description : [
        "英雄のビルド画像をTwitterにアップロードします。",
        "※アップロード先のアカウントは本BOTの管理アカウントになります。",
        "※アップロード時にDiscordのサーバ名とユーザ名も併せて投稿されます。"
    ].join("\r\n"),

    options : [
        {
            type: 11,
            name: "image",
            description: "アップロードするステータス画像",
            required : true
        },
        {
            type: 3,
            name: "comment",
            description: "ツイートに含めたい文言を設定します(任意)",
            required : false
        }
    ]
};

const run = async () => {
    const configure = require("../../configure.js");

    const client = new Client({intents: 0});

    client.once("ready", async () => {
        console.log("ready");
        await client.application.commands.set([
            commands["ep7-score"],
            commands["ep7-build"],
            commands["ep7-st"],
            commands["ep7-upload"]
        ]);

        console.log("complete");
    });
    client.login(configure.discordToken);
};

run();