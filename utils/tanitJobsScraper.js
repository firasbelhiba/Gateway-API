//https://www.tanitjobs.com/
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

module.exports = async function scrapeJobTanit(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    console.log("1");

    let tanitJobsTitle = [];
    let links = [];
    let locationAndCompany = [];

    $(".media-heading").each((i, element) => {
      tanitJobsTitle.push($(element).find("a").text());
      links.push($(element).find("a").attr("href"));
    });

    $(".listing-item__info").each((i, element) => {
      $(element)
        .find("span")
        .each((i, elem) => {
          locationAndCompany.push($(elem).text());
        });
    });

    console.log("2");

    var tanitJobsTitleOrg = JSON.stringify(tanitJobsTitle);
    tanitJobsTitleOrg = tanitJobsTitleOrg.replace(/\\n/g, "");
    tanitJobsTitleOrg = tanitJobsTitleOrg.replace(/\\t/g, "");

    var locationAndCompanyOrg = JSON.stringify(locationAndCompany);
    locationAndCompanyOrg = locationAndCompanyOrg.replace(/\\n/g, "");
    locationAndCompanyOrg = locationAndCompanyOrg.replace(/\\t/g, "");
    locationAndCompanyOrg = locationAndCompanyOrg.replace(
      /("(?:\\"|[^"])*")|\s/g,
      "$1"
    );

    fs.writeFileSync("data/tanitjobs/tanitJobsTitle.json", tanitJobsTitleOrg);

    fs.writeFileSync(
      "data/tanitjobs/locationAndCompany.json",
      locationAndCompanyOrg
    );

    fs.writeFileSync("data/tanitjobs/TJLinks.json", JSON.stringify(links));
  } catch (e) {
    console.error(e);
  }
};
