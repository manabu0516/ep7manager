
const run = async () => {
    const application = await require("../../application")(["ocrreader", "wikidata", "salesforce"], {discord:false, twitter:false});
    
    const imagePath = process.argv[2];
    const heroName = process.argv[3];
    const data = await application._context.lib.fs.readFile(imagePath);
    
    const result = await application.ocrreader.callApi("recognize", [data, {
        sliceCount : 0,
        dataCount : 9
    }]);

    await application.ocrreader.callApi("prepareDot",  [result]);    
    const upload = await application.salesforce.callApi("post",  ["test", "", heroName, result]);
    console.log(upload);
};

run();