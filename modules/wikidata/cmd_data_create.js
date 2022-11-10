
const run = async () => {
    const application = await require("../../application")(["wikidata"], {discord:false, twitter:false});
};

run();