
const run = async () => {
    const application = await require("../../application")(["salesforce"], {discord:false, twitter:false});

    const heroName = process.argv[2];
    const bui = process.argv[3];
    const optionData = process.argv[4];
    const password = process.argv[5];

    const data = await application.salesforce.callApi("post", [heroName, bui, optionData, password]);
    console.log(data);
};

run();