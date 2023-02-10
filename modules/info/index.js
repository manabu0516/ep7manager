
module.exports = async (parameter) => {
    const builder = parameter.instance();

    const infos = (await parameter.lib.fs.readdir(parameter.moduleDir + '/data')).reverse();

    const parseCount = (data, def) => {
        if(data === undefined || data === null || (typeof data) !== 'number') {
            return def;
        }
        return data > 0 ? data : def;
    };

    builder.addApi('get', async (count) => {
        const paramCount = parseCount(count, infos.length);
        const loopCount = paramCount > infos.length ? infos.length : paramCount;

        const result = [];

        for (let i = 0; i < loopCount; i++) {
            const path = infos[i];
            const textData = await parameter.lib.fs.readFile(parameter.moduleDir + '/data/' + path, 'utf-8');
            result.push(textData);
        }

        return result.map(text => {
            const entries = text.split("\n");
            return {
                title : entries[0].trim(),
                description : entries[1].trim(),
                data : entries.slice(3).join("\r\n")
            };
        });
    });


    return builder;
};