
const run = async () => {
    const application = await require("../../application")(["wikidata"], {discord:false, twitter:false});

    const heroName = process.argv[2];

    const wikidata = application.wikidata;
    const entries = await wikidata.callApi("entries", []);

    const module_epic7x = require(wikidata.directries.moduleDir + '/webdata/en_epic7x.js');
    const module_ja_wikidata = require(wikidata.directries.moduleDir + '/webdata/ja_wikidata.js')();

    const targets = heroName !== undefined && heroName !== null && heroName.trim() !== "" ? [heroName.trim()] : entries;
    for (let i = 0; i < targets.length; i++) {
        const key = targets[i];

        try {
            
            const data = await module_epic7x(key);
            const alias = await wikidata.callApi("alias", [key]);
            
            await module_ja_wikidata(alias, data);
            const json = JSON.stringify(data, undefined, '\t');
            const path = wikidata.directries.publicDir + '/json/hero/' + key + '.json';
            
            application._context.lib.fs.writeFile(path, json);
            console.log(key + " :complete.");
        } catch(e) {
            console.log(key + " :error. " + e);
        }
    }
};

run();