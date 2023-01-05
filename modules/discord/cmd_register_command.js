
const { Client, ApplicationCommandOptionType } = require("discord.js");
const commands = {};

commands ["ep7-score"] = {
    name : "ep7-score",
    description : "Shows the score of the uploaded equipment image.",
    description_localizations : {
        "en-US" : "Shows the score of the uploaded equipment image.",
        "zh-CN" : "Shows the score of the uploaded equipment image.",
        "ko" : "Shows the score of the uploaded equipment image.",
        "ja" : "アップロードされた装備画像のスコアを表示します。"
    },

    options : [
        {
            type: 11,
            name: "image",
            description: "Equipped image to calculate the score",
            description_localizations : {
                "en-US" : "Equipped image to calculate the score",
                "zh-CN" : "Equipped image to calculate the score",
                "ko" : "Equipped image to calculate the score",
                "ja" : "スコアを計算する装備画像"
            },
            required : true
        },
        {
            type: 3,
            name: "heroname",
            description: "The name of the hero used for percentage conversion of real number status",
            description_localizations : {
                "en-US" : "The name of the hero used for percentage conversion of real number status",
                "zh-CN" : "The name of the hero used for percentage conversion of real number status",
                "ko" : "The name of the hero used for percentage conversion of real number status",
                "ja" : "実数ステの割合換算に使用する英雄の名称"
            },
            required : false
        },
        {
            type: 3,
            name: "language",
            description: "Equipment image language",
            description_localizations : {
                "en-US" : "Equipment image language",
                "zh-CN" : "Equipment image language",
                "ko" : "Equipment image language",
                "ja" : "装備画像の言語"
            },
            required : false,
            choices: [
                { name: "jp", value: "jp" },
                { name: "cn", value: "cn" },
                { name: "ko", value: "ko" },
                { name: "en", value: "en" },
            ]
        }
    ]
};

commands ["ep7-build"] = {
    name : "ep7-build",
    description : "Displays the equipped image of the hero specified by the parameter",
    description_localizations : {
        "en-US" : "Displays the equipped image of the hero specified by the parameter",
        "zh-CN" : "Displays the equipped image of the hero specified by the parameter",
        "ko" : "Displays the equipped image of the hero specified by the parameter",
        "ja" : "パラメータで指定された英雄の装備画像を表示します"
    },

    options : [
        {
            type: 3,
            name: "heroname",
            description: "The name of the hero whose equipment image you want to display",
            description_localizations : {
                "en-US" : "The name of the hero whose equipment image you want to display",
                "zh-CN" : "The name of the hero whose equipment image you want to display",
                "ko" : "The name of the hero whose equipment image you want to display",
                "ja" : "装備画像を表示したい英雄の名称"
            },
            required : true
        },
        {
            type: 3,
            name: "pageno",
            description: "Specify the page to display (if not specified, page 1 will be displayed)",
            description_localizations : {
                "en-US" : "Specify the page to display (if not specified, page 1 will be displayed)",
                "zh-CN" : "Specify the page to display (if not specified, page 1 will be displayed)",
                "ko" : "Specify the page to display (if not specified, page 1 will be displayed)",
                "ja" : "表示するページを指定します(未指定の場合は1ページ目を表示)"
            },
            required : false
        }
    ]
};

commands ["ep7-st"] = {
    name : "ep7-st",
    description : "Shows the status of the hero specified by the parameter",
    description_localizations : {
        "en-US" : "Shows the status of the hero specified by the parameter",
        "zh-CN" : "Shows the status of the hero specified by the parameter",
        "ko" : "Shows the status of the hero specified by the parameter",
        "ja" : "パラメータで指定された英雄のステータスを表示します"
    },

    options : [
        {
            type: 3,
            name: "heroname",
            description: "The name of the hero whose status you want to display",
            description_localizations : {
                "en-US" : "The name of the hero whose status you want to display",
                "zh-CN" : "The name of the hero whose status you want to display",
                "ko" : "The name of the hero whose status you want to display",
                "ja" : "ステータスを表示したい英雄の名称"
            },
            required : true
        },
        {
            type: 3,
            name: "language",
            description: "Display language",
            description_localizations : {
                "en-US" : "Display language",
                "zh-CN" : "Display language",
                "ko" : "Display language",
                "ja" : "表示言語"
            },
            required : false,
            choices: [
                { name: "jp", value: "jp" },
                { name: "en", value: "en" },
            ]
        }
    ]
};

commands ["ep7-upload"] = {
    name : "ep7-upload",
    description : "Upload your hero build image to Twitter.",
    description_localizations : {
        "en-US" : "Upload your hero build image to Twitter.",
        "zh-CN" : "Upload your hero build image to Twitter.",
        "ko" : "Upload your hero build image to Twitter.",
        "ja" : "英雄のビルド画像をTwitterにアップロードします。※アップロード先のアカウントは本BOTの管理アカウントになります。※アップロード時にDiscordのサーバ名とユーザ名も併せて投稿されます"
    },

    options : [
        {
            type: 11,
            name: "image",
            description: "Status image to upload",
            description_localizations : {
                "en-US" : "Status image to upload",
                "zh-CN" : "Status image to upload",
                "ko" : "Status image to upload",
                "ja" : "アップロードするステータス画像"
            },
            required : true
        },
        {
            type: 3,
            name: "comment",
            description: "Set the wording you want to include in the tweet (optional)",
            description_localizations : {
                "en-US" : "Set the wording you want to include in the tweet (optional)",
                "zh-CN" : "Set the wording you want to include in the tweet (optional)",
                "ko" : "Set the wording you want to include in the tweet (optional)",
                "ja" : "ツイートに含めたい文言を設定します(任意)"
            },
            required : false
        }
    ]
};

commands ["ep7-info"] = {
    name : "ep7-info",
    description : "Display BOT update information",
    description_localizations : {
        "en-US" : "Display BOT update information",
        "zh-CN" : "Display BOT update information",
        "ko" : "Display BOT update information",
        "ja" : "BOTの更新情報を表示します"
    },

    options : [
        {
            type: 3,
            name: "count",
            description: "Specify the number of items to display (all items when 0 is specified)",
            description_localizations : {
                "en-US" : "Specify the number of items to display (all items when 0 is specified)",
                "zh-CN" : "Specify the number of items to display (all items when 0 is specified)",
                "ko" : "Specify the number of items to display (all items when 0 is specified)",
                "ja" : "表示件数を指定します(0指定時は全件)"
            },
            required : false
        }
    ]
};

commands["ep7-henkan-delete"] = {
    name : "ep7-henkan-delete",
    description : "Delete a registered conversion stone.",
    description_localizations : {
        "en-US" : "Delete a registered conversion stone.",
        "zh-CN" : "Delete a registered conversion stone.",
        "ko" : "Delete a registered conversion stone.",
        "ja" : "登録済みの変換石を削除します。"
    },

    options : [
        {
            type: 3,
            name: "uniqueid",
            description: "Unique ID for managing data",
            description_localizations : {
                "en-US" : "Unique ID for managing datar",
                "zh-CN" : "Unique ID for managing data",
                "ko" : "Unique ID for managing data",
                "ja" : "データを管理するための一意なID(IDをもとにユーザのデータを管理します）"
            },
            required : true
        },
        {
            type: 3,
            name: "dataid",
            description: "Data ID to be deleted(Delete all by specifying all)",
            description_localizations : {
                "en-US" : "Data ID to be deleted(Delete all by specifying all)",
                "zh-CN" : "Data ID to be deleted(Delete all by specifying all)",
                "ko" : "Data ID to be deleted(Delete all by specifying all)",
                "ja" : "削除対象のデータID(all指定で全削除)"
            },
            required : true
        }
    ]
};

commands["ep7-henkan-get"] = {
    name : "ep7-henkan-get",
    description : "Display registered conversion stones.",
    description_localizations : {
        "en-US" : "Display registered conversion stones.",
        "zh-CN" : "Display registered conversion stones.",
        "ko" : "Display registered conversion stones.",
        "ja" : "登録済みの変換石を表示します。"
    },

    options : [
        {
            type: 3,
            name: "uniqueid",
            description: "Unique ID for managing data",
            description_localizations : {
                "en-US" : "Unique ID for managing datar",
                "zh-CN" : "Unique ID for managing data",
                "ko" : "Unique ID for managing data",
                "ja" : "データを管理するための一意なID(IDをもとにユーザのデータを管理します）"
            },
            required : true
        }
    ]
};

commands["ep7-henkan-put"] = {
    name : "ep7-henkan-put",
    description : "This command regist conversion stones.",
    description_localizations : {
        "en-US" : "This command regist conversion stones.",
        "zh-CN" : "This command regist conversion stones.",
        "ko" : "This command regist conversion stones.",
        "ja" : "変換石の登録を行うコマンドです"
    },

    options : [
        {
            type: 3,
            name: "uniqueid",
            description: "Unique ID for managing data",
            description_localizations : {
                "en-US" : "Unique ID for managing datar",
                "zh-CN" : "Unique ID for managing data",
                "ko" : "Unique ID for managing data",
                "ja" : "データを管理するための一意なID(IDをもとにユーザのデータを管理します）"
            },
            required : true
        },
        {
            type: 3,
            name: "heroname",
            description: "The name of the hero whose conversion stone you want to register",
            description_localizations : {
                "en-US" : "The name of the hero whose conversion stone you want to register",
                "zh-CN" : "The name of the hero whose conversion stone you want to register",
                "ko" : "The name of the hero whose conversion stone you want to register",
                "ja" : "変換石を登録したい英雄の名称"
            },
            required : true
        },
        {
            type: 3,
            name: "target",
            description: "Equipment location",
            description_localizations : {
                "en-US" : "Equipment location",
                "zh-CN" : "Equipment location",
                "ko" : "Equipment location",
                "ja" : "装備箇所"
            },
            required : true,
            choices: [
                { name: "武器", value: "武器" },
                { name: "頭具", value: "頭具" },
                { name: "胴具", value: "胴具" },
                { name: "首飾り", value: "首飾り" },
                { name: "指輪", value: "指輪" },
                { name: "脚具", value: "脚具" },
            ]
        },
        {
            type: 3,
            name: "pos",
            description: "Option value",
            description_localizations : {
                "en-US" : "Option value",
                "zh-CN" : "Option value",
                "ko" : "Equipment location",
                "ja" : "変換オプション"
            },
            required : true,
            choices: [
                { name: "攻撃", value: "攻撃" },
                { name: "攻撃実数", value: "攻撃実数" },
                { name: "生命", value: "生命" },
                { name: "生命実数", value: "生命実数" },
                { name: "防御", value: "防御" },
                { name: "速度", value: "速度" },
                { name: "効果命中", value: "効果命中" },
                { name: "効果抵抗", value: "効果抵抗" },
                { name: "クリ発", value: "クリ発" },
                { name: "クリダメ", value: "クリダメ" },
            ]
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
            commands["ep7-upload"],
            commands["ep7-info"],
            commands["ep7-henkan-put"],
            commands["ep7-henkan-get"],
            commands["ep7-henkan-delete"]
        ]);

        console.log("complete");
    });
    client.login(configure.discordToken);
};

run();