const run = async() => {
    const application = await require ("./application")();
    console.log("initialize application.");
};

run();