
const run = async () => {
    const application = await require("../../application")(["wikidata"], {discord:false, twitter:false});

    const entries = await application.wikidata.callApi("entries", []);

    attributeMap = {
        "fire" : "火",
        "earth" : "木",
        "ice" : "氷",
        "dark" : "闇",
        "light": "光"
    };

    clazzMap = {
        "warrior" : "ウォリアー",
        "thief" : "アサシン",
        "mage"  : "メイジ",
        "ranger" : "アーチャー",
        "knight" : "ナイト",
        "soul-weaver" : "プリースト"
    }
    
    console.log("名称,属性,職業,初期レアリティ");
    for (let i = 0; i < entries.length; i++) {
        try {
            const e = entries[i];
            const data = await application.wikidata.callApi("load", [e]);
            const name = data.common.name_ja;
            const attribute = attributeMap[data.common.attribute];
            const clazz = clazzMap[data.common.clazz];
            const rarity = parseInt(data.common.rarity);
            console.log(name+','+attribute+','+clazz+','+rarity);
        } catch(e) {
        }
    }
};

run();