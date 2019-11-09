const axios = require("axios");
const cheerio = require("cheerio");
const bookUrl = "";
const url = "https://www.amazon.com/";
const fs = require("fs");
const searchCache = {};
const newUrl = "";
const util = require("util");

// const getBookDetailsPlaceHolder =  "https://www.amazon.com/Wrecking-Ball-Diary-Wimpy-Book/dp/1419739034/ref=zg_bs_books_1/133-6604737-0662119?_encoding=UTF8&psc=1&refRID=81WZXDVEP69KBTR6PJD1%27";

// amazon.com/books final step 'good spider'
const getBookDetails = async links => {
  for (let i = 1; i < links.length + 1; i++) {
    try {
      const id = i;
      const response = await axios.get(`${url}${links[i]}`);
      const $ = cheerio.load(response.data);

      // Name

      const name = $("#productTitle").text();

      // List Price
      const price = $(
        "#buyBoxInner > div > div.a-column.a-span7.a-text-right.a-span-last > ul > li:nth-child(1) > span > span.a-color-secondary.a-text-strike"
      ).text();

      // Description //not working :(
      const description = $("body div#iframeContent[dir='auto'] > div > p")
        .children()
        .text();

      // Product Dimensions & Weight
      const product_dimensions = [];
      const shipping_weight = [];
      $("#productDetailsTable > tbody > tr > td > div > ul").each(function(
        i,
        element
      ) {
        const el = $(element);
        const dimensionmatch = /inches/;
        const weightmatch = /Shipping/;
        const info = el
          .find("li")
          .text()
          .split(":");

        for (let i = 0; i < info.length; i++) {
          if (info[i].match(dimensionmatch)) {
            try {
              const productDimension = info[i].match(/(\d)(.*)(inches)/)[0];
              product_dimensions.push(productDimension);
            } catch (error) {
              // console.error(error);
            }
          } else if (info[i].match(weightmatch));
          {
            try {
              const productWeight = info[i].match(/(\d)(.*)(pounds|ounces)/)[0];
              shipping_weight.push(productWeight);
            } catch (error) {
              //
            }
          }
        }
      });

      // Image URLs
      const imageUrl = $("#imgThumbs > div > img").attr("src");

      const bookDetail = {
        id: id, //working
        name: name, //working
        price: price, //working
        description: description, //nope
        productDimensions: product_dimensions, //working
        imageUrl: imageUrl, //working
        weight: shipping_weight //working
      };

      const fs = require("fs");
      fs.appendFile("books.txt", util.inspect(bookDetail), function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log("hip hip hooray!");
        }
      });
      // console.log(bookDetail);
    } catch (error) {
      console.error("getBookDetails" + error);
    }
  }
};

// const goToBooksPlaceHolder =
//   "https://www.amazon.com/best-sellers-books-Amazon/zgbs/books/ref=zg_bs_nav_0/133-6604737-0662119";

// amazon.com/best seller books step 3 'go spider, go!'
const goToBooks = async title => {
  try {
    const response = await axios.get(`${title}`);

    const $ = cheerio.load(response.data);

    const links = [];
    $("ol#zg-ordered-list li").each(function(i, element) {
      if (i < 11) {
        const el = $(element);
        const link = el.find("a.a-link-normal").attr("href");

        links.push(link);
      }
    });
    console.log(links);

    getBookDetails(links);
  } catch (error) {
    console.log("goToBooks: " + error);
  }
};

// const getBooksplaceholder =
//   "https://www.amazon.com/gp/bestsellers/?ref_=nav_cs_bestsellers";

//amazon.com/best sellers step 2
const getBookLink = async newLink => {
  try {
    const response = await axios.get(`${url}` + `${newLink}`);
    const title = [];

    const $ = cheerio.load(response.data);
    const titles = $("#zg_browseRoot > ul > li:nth-child(10) > a").attr("href");
    title.push(titles);
    //get link for books, drop it into goToBooks
    goToBooks(title);
  } catch (error) {
    console.error("getBookLink" + error);
  }
};

//amazon.com step 1
const getBooks = async () => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const newLink = $("div#nav-xshop a[tabindex='47']").html("href")[0].attribs
      .href;

    //grab link for next page, go to getbooklink
    getBookLink(newLink);
  } catch (error) {
    console.error("getBooks:   " + error);
  }
};

getBooks();
