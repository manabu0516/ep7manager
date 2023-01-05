
const run = async () => {
    const application = await require("../../application")(["salesforce", "wikidata"], {discord:false, twitter:false});

    const password = process.argv[2];
    const dataid = process.argv[3];
    const data = await application.salesforce.callApi("delete", [password, dataid]);
    console.log(data);
};

run();