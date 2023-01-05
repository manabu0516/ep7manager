
const run = async () => {
    const application = await require("../../application")(["salesforce"], {discord:false, twitter:false});

    const password = process.argv[2];
    const dataid = process.argv[1];
    const data = await application.salesforce.callApi("delete", [password, dataid]);
    console.log(data);
};

run();