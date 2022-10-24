
const run = async () => {
    const application = await require("../../application")(["tweetsearch", "wikidata"], {discord:false, twitter:false});

    const heroName = process.argv[2];
    const data = await application.tweetsearch.callApi("get", [heroName]);

    console.log(data);
};

run();