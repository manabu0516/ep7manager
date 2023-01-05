
const run = async () => {
    const application = await require("../../application")(["salesforce", "wikidata"], {discord:false, twitter:false});

    const password = process.argv[2];
    const data = await application.salesforce.callApi("get", [password]);
    console.log(data);
};

run();