module.exports = async (parameter) => {
    const imageDir = parameter.moduleDir + '/images';
    const buildsDir = parameter.publicDir;

    const builder = parameter.instance();

    builder.addApi('post', async (heroname, bui, optionData) => {
        const options = {
            uri: "https://test707-dev-ed.develop.my.salesforce-sites.com/services/apexrest/henlanseki/create",
            headers: {"Content-type": "application/json"},
            method: 'POST',
            json: {
                "heroName": "param1",
                "bui": "param2",
                "optionData": "param2",
                "password": "param2",
            }
        };
        const result = await parameter.lib.request(options);
        return result;
    });

    return builder;
};