const prepareValue = (text) => {
    return parseFloat(text.replace("%", ""));
};

module.exports = async (parameter) => {
    const imageDir = parameter.moduleDir + '/images';
    const buildsDir = parameter.publicDir;

    const builder = parameter.instance();

    builder.addApi('delete', async (password, dataid) => {
        const options = {
            uri: "https://test707-dev-ed.develop.my.salesforce-sites.com/services/apexrest/status/delete/"+password,
            headers: {"Content-type": "application/json"},
            method: 'POST',
            json: {
                "id": dataid,
            }
        };

        const result = await parameter.lib.request(options);
        return typeof result === "string" ? JSON.parse(result) : result;
    });

    builder.addApi('post', async (password, dataid, heroName, status) => {
        const options = {
            uri: "https://test707-dev-ed.develop.my.salesforce-sites.com/services/apexrest/status/post/"+password,
            headers: {"Content-type": "application/json"},
            method: 'POST',
            json: {
                "heroName": heroName,
                "id": dataid,
                'CriticalDamage' : prepareValue(status["クリダメ"]),
                'CriticalHit' : prepareValue(status["クリ発"]),
                'Speed' : prepareValue(status["スピード"]),
                'Effect' : prepareValue(status["効果命中"]),
                'Resist' : prepareValue(status["効果抵抗"]),
                'Attack' : prepareValue(status["攻撃力_実数"]),
                'Health' : prepareValue(status["生命力_実数"]),
                'Defense' : prepareValue(status["防御力_実数"]),
                'Combination' : prepareValue(status["連携"]),
            }
        };

        const result = await parameter.lib.request(options);
        return typeof result === "string" ? JSON.parse(result) : result;
    });

    return builder;
};
