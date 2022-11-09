
const run = async () => {
    const application = await require("../../application")(["info"], {discord:false, twitter:false});
    const entries = await application.info.callApi("get", []);

    entries.forEach(element => {
        console.log(element);
    });
};

run();