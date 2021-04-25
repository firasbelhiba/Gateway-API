/******************************************************* */
/**********THIS FILE IS NOT USED  ************************/
/*****THE CONTENT IS USED DIRECTLY WHERE IT SHOULD TO BE */
/******************************************************* */

//https://stackoverflow.com/jobs
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

module.exports = async function scrapeJobStackoverflow(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);
    let links = [];
    let jobTitles = [];
    let jobImage = [];
    let aboutJob = [];
    let sortedAboutJob = [];

    console.log("1");

    $(".-job").each((i, element) => {
      links.push($(element).attr("data-preview-url"));
      jobTitles.push($(element).find("h2").find("a").text());
      jobImage.push($(element).find("img").attr("src"));
    });

    console.log("2");

    for (let link of links) {
      await page.goto(`https://stackoverflow.com/${link}`);
      $("#overview-items").each((i, element) => {
        $(element)
          .find("section")
          .find("span")
          .each((i, elem) => {
            aboutJob.push($(elem).text());
          });
      });
    }

    console.log("3");

    for (let i = 1; i < aboutJob.length; i += 2) {
      sortedAboutJob.push(aboutJob[i]);
    }

    fs.writeFileSync(
      "data/stackoverflow/jobTitles.json",
      JSON.stringify(jobTitles)
    );
    fs.writeFileSync(
      "data/stackoverflow/jobImage.json",
      JSON.stringify(jobImage)
    );
    fs.writeFileSync(
      "data/stackoverflow/aboutJob.json",
      JSON.stringify(sortedAboutJob)
    );
    fs.writeFileSync("data/stackoverflow/SOLinks.json", JSON.stringify(links));

    console.log("4");
  } catch (e) {
    console.error(e);
  }
};
