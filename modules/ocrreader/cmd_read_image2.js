
const run = async () => {
    const application = await require("../../application")(["ocrreader", "wikidata"], {discord:false, twitter:false});
    const target = application.ocrreader;

    const imagePath = process.argv[2];
    const data = await application._context.lib.fs.readFile(imagePath);
    
    const result = await target.callApi("recognize", [data, {
        sliceCount : 0,
        dataCount : 9
    }]);

    await target.callApi("prepareDot",  [result]);
    console.log(result);
};

run();