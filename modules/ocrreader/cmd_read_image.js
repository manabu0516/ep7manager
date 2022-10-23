
const run = async () => {
    const application = await require("../../application")(["ocrreader", "wikidata"], {discord:false, twitter:false});
    const target = application.ocrreader;

    const imagePath = process.argv[2];
    const heroName = process.argv[3];

    const data = await application._context.lib.fs.readFile(imagePath);
    
    const result = await target.callApi("recognize", [data]);
    const heroData = await application.wikidata.callApi("load", [heroName]);

    const statusData = heroData != null ? {
        "攻撃力" : heroData["ステータス"]["攻撃力"]["最大値"],
        "生命力" : heroData["ステータス"]["生命力"]["最大値"],
        "防御力" : heroData["ステータス"]["防御力"]["最大値"]
    } : undefined;

    const score = await target.callApi("score", [result, statusData]);
    console.log(score);

};

run();