
const run = async () => {
    const application = await require("../../application")(["tweetsearch", "wikidata"], {discord:false, twitter:false});

    const publicDir = application.tweetsearch.directries.publicDir;
    const entries = await application.wikidata.callApi("entries", []);

    for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const imgPath = publicDir + '/' + e;
        await application._context.lib.fs.mkdir(imgPath, { recursive: true });
    }
    console.log("complete");
};

run();