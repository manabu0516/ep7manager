
const run = async () => {
    const application = await require("../../application")(["tweetsearch"], {discord:false, twitter:true});
    const lastId = await application.tweetsearch.callApi("search", [null]);
    console.log("Last Id: " + lastId);
};

run();