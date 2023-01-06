
const run = async () => {
    const application = await require("../../application")(["ocrreader", "wikidata", "salesforce"], {discord:false, twitter:false});
    
    const dataid = process.argv[2];

    const upload = await application.salesforce.callApi("delete",  ["test", dataid]);
    console.log(upload);
};

run();