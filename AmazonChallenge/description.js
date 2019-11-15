const axios = require('axios')
const cheerio = require('cheerio')

const getBookDetails = async links => {

    try {

        const response = await axios.get('https://www.amazon.com/Wrecking-Ball-Diary-Wimpy-Book/dp/1419739034/ref=zg_bs_books_1/133-6604737-0662119?_encoding=UTF8&psc=1&refRID=81WZXDVEP69KBTR6PJD1%27');
        const $ = cheerio.load(response.data);

        // Name

        const name = $("#productTitle").text();


        // Description //not working :(
        const description = $("div#bookDescription_feature_div > noscript").text()

        console.log('description' + description)



    } catch (error) {
        console.error("getBookDetails" + error);
    }

};

getBookDetails()