
const fileExist = async (fs, path) => {
    try {
        await fs.lstat(path);
        return true;
    } catch(e) {
        return false;
    }
};

const twitterDate = (text) => {
    const created_at = text.split(" ");
    const post_date  = created_at[1] + " " + created_at[2] + ", " + created_at[5] + " " + created_at[3];
    const date = new Date(post_date);
    date.setHours(date.getHours() + 9);

    return date;
};

module.exports = async (parameter) => {
    const imageDir = parameter.moduleDir + '/images';
    const buildsDir = parameter.publicDir;

    const builder = parameter.instance();

    const searchTweet = async (paramLastId) => {
        const context = {max_id : paramLastId ,maxloop : 50};

        const toDay = new Date();
        const targetDate = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate()-2, 0,0,0);

        const lastId = await parameter.twitter.search("#エピックセブン", context, async (data) => {
            const media = data.entities.media;
            if(media === undefined) {
                return;
            }
            const createdAt = twitterDate(data.created_at);
            if(targetDate > createdAt) {
                return;
            }

            const tweetId = data.id_str;
            const tweetText = data.text;
            const urls = media.filter(m => m.type === 'photo').map(e => e.media_url_https);
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                const filename = url.substring(url.lastIndexOf("/")+1);
                const filepath = imageDir + '/' + filename;

                if(await fileExist(parameter.lib.fs, filepath) == true) {
                    continue;
                }

                const response = await parameter.lib.request(url, {encoding: null});
                await parameter.lib.fs.writeFile(filepath, response);
            }
        });

        return lastId;
    };

    parameter.cron.schedule('0 0 11 * * *',async () => {
        console.log("--tweetseach - start search");
        await searchTweet(null);
        console.log("--tweetseach - end search");
    });

    builder.addApi('get', async (key) => {
        try {
            const path = buildsDir + '/' + key;
            const list = await parameter.lib.fs.readdir(path);
            return list.map(e => 'https://manabu0516.github.io/ep7manager/tweetsearch/' + encodeURI(key) + '/' + e);
        } catch(e) {
            return [];
        }
    });

    builder.addApi('epic7stats', async (fromDt) => {
        const urls = ((response) => {
            const $ = parameter.lib.cheerio.load(response);
            const result = [];
            $(".hero-portrait a").each((i, tag) => {
                const link = "https://www.epic7stats.com/" + $(tag).attr("href");
                result.push(link);
            });

            return result;
       })(await parameter.lib.request("https://www.epic7stats.com/hero/all"));

       const imageUrls = [];
       for (let i = 0; i < urls.length; i++) {
            try {
                const url = urls[i];
                const response = await parameter.lib.request(url);
                const $ = parameter.lib.cheerio.load(response);
                
                $("#build-tbl tbody tr").each((i,tr) => {
                    const td = $(tr).children("td").last();

                    const updateAt = new Date($(td).prev().html().trim().replaceAll("-", "/"));
                    
                    if( (fromDt !== undefined && fromDt < updateAt) || fromDt === undefined) {
                        const url = 'https://e7rta-builds.s3.us-east-2.amazonaws.com/' + $(td).html().trim().replace(" ", "%20");
                        imageUrls.push(url);
                    }
                });
            } catch(e) {
            }
       }

       for (let i = 0; i < imageUrls.length; i++) {
            try {
                const url = imageUrls[i];
                console.log(url);
                const filename = url.substring(url.lastIndexOf("/")+1);
                const filepath = imageDir + '/' + filename;
                
                if(await fileExist(parameter.lib.fs, filepath) == true) {
                    continue;
                }
                
                const response = await parameter.lib.request(url, {encoding: null});
                await parameter.lib.fs.writeFile(filepath, response);
            } catch(e) {
                console.log("---error : " +  imageUrls[i]);
            }
       }
    });

    builder.addApi('search', async (paramLastId) => {
        return await searchTweet(paramLastId);
    });

    return builder;
};