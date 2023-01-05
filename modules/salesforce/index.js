module.exports = async (parameter) => {
    const imageDir = parameter.moduleDir + '/images';
    const buildsDir = parameter.publicDir;

    const builder = parameter.instance();

    builder.addApi('post', async (heroname, bui, optionData) => {

        

    });

    return builder;
};