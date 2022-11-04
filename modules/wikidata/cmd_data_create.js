
const run = async () => {
    const application = await require("../../application")(["wikidata"], {discord:false, twitter:false});
    
    const key = process.argv[2];
    if(key === undefined || key === null || key.trim() === "") {
        return;
    }
    const data = await application.wikidata.callApi("load", [key.trim(), {
        force : true
    }]);

    console.log(JSON.stringify(data, null , "\t"));
};

run();