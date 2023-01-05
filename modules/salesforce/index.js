module.exports = async (parameter) => {
    const imageDir = parameter.moduleDir + '/images';
    const buildsDir = parameter.publicDir;

    const builder = parameter.instance();

    builder.addApi('post', async (heroname, bui, optionData, password) => {
        const options = {
            uri: "https://test707-dev-ed.develop.my.salesforce-sites.com/services/apexrest/henlanseki/create",
            headers: {"Content-type": "application/json"},
            method: 'POST',
            json: {
                "heroName": heroname,
                "bui": bui,
                "optionData": optionData,
                "password": password,
            }
        };
        const result = await parameter.lib.request(options);
        return result;
    });

    builder.addApi('get', async (password) => {
        const result = await parameter.lib.request("https://test707-dev-ed.develop.my.salesforce-sites.com/services/apexrest/henlanseki/get/"+password);
        return result;
    });

    builder.addApi('delete', async (password, dataId) => {
        const options = {
            uri: "https://test707-dev-ed.develop.my.salesforce-sites.com/services/apexrest/henlanseki/delete/"+password+'/'+dataId,
            method: 'DELETE'
        };
        const result = await parameter.lib.request(options);
        return result;
    });

    return builder;
};