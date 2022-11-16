

const run = async () => {
    const application = await require("../../application")(["tweetsearch"], {discord:false, twitter:false});

    const target = application.tweetsearch;

    const files = [];
    const keys = (await application._context.lib.fs.readdir(target.directries.publicDir)).filter(e => e != 'jsonp.js');
    
    for (let idx = 0; idx < keys.length; idx++) {
        const key = keys[idx];
        const images = await application._context.lib.fs.readdir(target.directries.publicDir + '/' + key);
        images.map(e => key + '/' +e).forEach(e => files.push(e));
    }

    const jsonp = '__ep7manager_load_build(' + JSON.stringify(files) + ')';
    await application._context.lib.fs.writeFile(target.directries.publicDir + '/jsonp.js', jsonp);
};

run();