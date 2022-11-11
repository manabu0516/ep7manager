

const resolveData = async (alias, option, context) => {
    const jsonDir = context.publicDir + '/json/hero';
    const dataFilePath = jsonDir + '/' + alias["_path"]; 

    const text = await context.fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(text);
};

class AliasManager {
    constructor() {
        this.datamap = {};
        this.normalizeKeys = [];
    };

    load(json) {
        const keys = Object.keys(json);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const data = json[key];

            data["_name"] = key;
            data["_path"] = this.normalize(key) + '.json';
            this.normalizeKeys.push(this.normalize(key));
            this.datamap[this.normalize(key)] = data;

            for (let j = 0; j < data.alias.length; j++) {
                const alias = data.alias[j];
                this.datamap[alias] = data;        
            }

            const localizeKeys = Object.keys(data.localize);
            for (let j = 0; j < localizeKeys.length; j++) {
                const locale = localizeKeys[j];
                
                const normalizeKey = this.normalize(data.localize[locale]);
                if(normalizeKey === "") {
                    continue;
                }
                this.datamap[normalizeKey] = data;
            }
        }
        return this;
    };

    normalize(text) {
        return text.replaceAll(" ", "-").toLocaleLowerCase().trim();
    }

    get(key) {
        const normalizeKey = this.normalize(key);
        return this.datamap[normalizeKey];
    }

    entries() {
        return this.normalizeKeys;
    }
};

module.exports = async (parameter) => {    
    const builder = parameter.instance();

    const aliasJson = JSON.parse(await parameter.lib.fs.readFile(parameter.moduleDir + '/alias.json', 'utf8'));
    const aliasData = new AliasManager().load(aliasJson);

    builder.addApi('entries', () => {
        return aliasData.entries();
    });

    builder.addApi('alias', (key) => {
        const data = aliasData.get(key);
        return data;
    });

    builder.addApi('normalize', (key) => {
        const data = aliasData.get(key.toLocaleLowerCase());
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