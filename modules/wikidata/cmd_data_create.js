
const fileExist = async (fs, path) => {
    try {
        await fs.lstat(path);
        return true;
    } catch(e) {
        return false;
    }
};

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
        const path = wikidata.directries.publicDir + '/json/hero/' + key + '.json';

        try {
            if((await fileExist(application._context.lib.fs, path)) === true) {
                continue;
            }
            const data = await module_epic7x(key);
            const alias = await wikidata.callApi("alias", [key]);
            
            await module_ja_wikidata(alias, data);
            const json = JSON.stringify(data, undefined, '\t');
            
            application._context.lib.fs.writeFile(path, json);
            console.log(key + " :complete.");
        } catch(e) {
            console.log(key + " :error. " + e);
        }
    }

    const aliasJson = await application._context.lib.fs.readFile(wikidata.directries.moduleDir + '/alias.json', 'utf-8');
    const jsonp = '__ep7manager_load_hero(' + aliasJson + ', []);';
    await application._context.lib.fs.writeFile(wikidata.directries.publicDir + '/jsonp.js', jsonp, 'utf-8');
};

run();