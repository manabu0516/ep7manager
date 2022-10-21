
const run = async () => {
    const application = await require("../../application")(["tweetsearch"], {discord:false, twitter:true});
    await application.tweetsearch.callApi("epic7stats", []);
};

run();