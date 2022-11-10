

const resolveData = async (alias, option, context) => {
    const jsonDir = context.publicDir + '/json/hero';
    const dataFilePath = jsonDir + '/' + alias["_path"]; 

    const text = await context.fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(text);
};

class AliasManager {
    constructor() {
        this.datamap = {};
    };

    load(json) {
        const keys = Object.keys(json);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const data = json[key];

            data["_name"] = this.key;
            data["_path"] = this.normalize(this.key) + '.json';

            for (let j = 0; j < data.alias.length; j++) {
                const alias = data.alias[j];
                this.datamap[alias] = data;           
            }

            const localize = Object.keys(data.localize);
            for (let j = 0; j < localize.length; j++) {
                const locale = localize[j];
                const normalizeKey = this.normalize(localize[locale]);
                if(normalizeKey === "") {
                    continue;
                }
                this.datamap[normalizeKey] = data;
            }
        }
    };

    normalize(text) {
        return text.replace(" ", "").toLocaleLowerCase().trim();
    }

    get(key) {
        const normalizeKey = this.normalize(key);
        return this.datamap[normalizeKey];
    }

    entries() {
        return Object.keys(this.datamap);
    }
};

module.exports = async (parameter) => {    
    const builder = parameter.instance();

    const aliasJson = JSON.parse(await parameter.lib.fs.readFile(parameter.moduleDir + '/alias.json', 'utf8'));
    const aliasData = new AliasManager().load(aliasJson);

    const listData = aliasData.entries().map(e => e + '.json');

    const jsonp = '__ep7manager_load_hero(' + JSON.stringify(listData) + ', []);';
    await parameter.lib.fs.writeFile(parameter.publicDir + '/jsonp.js', jsonp, 'utf-8');

    builder.addApi('entries', () => {
        return aliasData.entries();
    });

    builder.addApi('normalize', (key) => {
        const data = aliasData.get(key);

        return data != undefined ? data._name : key;
    });

    builder.addApi('load', async (key, option) => {
        option = option ? option : {};

        const alias = aliasData.get(key);
        if(alias === undefined || alias === null) {
            return null;
        }
        
        const data = resolveData(alias, option, {
            fs : parameter.lib.fs,
            publicDir : parameter.publicDir
        });
        return data;
    });

    return builder;
};