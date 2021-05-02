const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const fs = require("fs");

//https://stackoverflow.com/jobs
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

//To change the page of the jobs use query params ?pg=n (n is the number of the page you want to scrape)

let links = [];
let jobTitles = [];
let jobImage = [];
let aboutJob = [];
let sortedAboutJob = [];

//@author Ghada Khedri
//@route GET api/scrape/scrape-stackoverflow
//@desc scrape jobs
//@access Private
router.get("/scrape-stackoverflow", async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://stackoverflow.com/jobs?pg=2");
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

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

    console.log("4");
    res.json({ message: "Scraped succefully ! " });
  } catch (e) {
    console.error(e);
  }
});

//@author Ghada Khedri
//@route GET api/scrape/get-scraped-data-stackoverflow
//@desc scrape jobs
//@access Private
router.get("/get-scraped-data-stackoverflow", auth, async (req, res) => {
  try {
    //scrapeJobStackoverflow("https://stackoverflow.com/jobs?pg=2");

    let scrapeList = [];
    let scrapeType = [];
    let scrapeExperience = [];

    for (let i = 0; i < sortedAboutJob.length; i += 6) {
      scrapeType.push(sortedAboutJob[i]);
    }

    for (let i = 1; i < sortedAboutJob.length; i += 6) {
      scrapeExperience.push(sortedAboutJob[i]);
    }

    for (let i = 0; i < 5; i++) {
      scrapeList.push({
        title: jobTitles[i],
        image: jobImage[i],
        link: links[i],
        type: scrapeType[i],
        experience: scrapeExperience[i],
      });
    }

    res.json(scrapeList);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//tanitjob
const jobTitleFromJson = fs.readFileSync(
  "././data/tanitjobs/tanitJobsTitle.json"
);
const locationAndCompanyFromJson = fs.readFileSync(
  "././data/tanitjobs/locationAndCompany.json"
);

let jobTitlesTJ = [];
let locationAndCompanyTJ = [];
let linksTJ = [];

//@author Ghada Khedri
//@route GET api/scrape/scrape-tanitjob
//@desc scrape jobs
//@access Private
router.get("/scrape-tanitjob", async (req, res) => {
  try {
    console.log('tanit')
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.tanitjobs.com/");
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    console.log("1");

    let tanitJobsTitle = [];
    let links = [];
    let locationAndCompany = [];

    $(".media-heading").each((i, element) => {
      tanitJobsTitle.push($(element).find("a").text());
      links.push($(element).find("a").attr("href"));
      linksTJ = links;
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

    jobTitlesTJ = JSON.parse(jobTitleFromJson);
    locationAndCompanyTJ = JSON.parse(locationAndCompanyFromJson);

    res.json(locationAndCompanyTJ);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route GET api/scrape/get-scraped-data-tanitjob
//@desc scrape jobs
//@access Private
router.get("/get-scraped-data-tanitjob", async (req, res) => {
  try {
    let scrapeList = [];
    let scrapeLocation = [];
    let scrapeCompany = [];

    for (let i = 0; i < locationAndCompanyTJ.length; i += 2) {
      scrapeCompany.push(locationAndCompanyTJ[i]);
    }

    for (let i = 1; i < locationAndCompanyTJ.length; i += 2) {
      scrapeLocation.push(locationAndCompanyTJ[i]);
    }

    for (let i = 0; i < 5; i++) {
      scrapeList.push({
        title: jobTitlesTJ[i],
        link: linksTJ[i],
        company: scrapeCompany[i],
        location: scrapeLocation[i],
      });
    }
    res.json(jobTitlesTJ);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});


//@author Ghada Khedri
//@route GET api/scrape/scrape-indeed
//@desc scrape jobs
//@access Private
router.get("/scrape-indeed", async (req, res) => {
  try {
    console.log('indeed')
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.indeed.com/companies/search?q=&l=Tunis%2C+AR&from=discovery-cmp-front-door");
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    console.log("1");

    let indeedLinks = [];
    let indeedJobTitlesAndRates = [];
    let indeedDescription = [];
    let indeedImages = [];


    $(".cmp-CompanyWidget-details").each((i, element) => {
      indeedLinks.push($(element).find("a").attr("href"));
      indeedJobTitlesAndRates.push($(element).find("a").text());
    });

    $(".cmp-CompanyWidget-description").each((i, element) => {
      indeedDescription.push($(element).text());
    });

    $(".icl-CompanyLogo").each((i, element) => {
      indeedImages.push($(element).find("img").attr("src"));
    });


    let indeedJobTitles = [];
    let indeedRate = [];

    for (let i = 0; i < indeedJobTitlesAndRates.length; i++) {
      let str1 = indeedJobTitlesAndRates[i];
      let str2 = indeedJobTitlesAndRates[i];

      str1 = str1.substring(0, str1.length - 3);
      str2 = str2.slice(str2.length - 3);

      indeedJobTitles.push(str1);
      indeedRate.push(str2)

    }


    fs.writeFileSync("data/indeed/indeedJobsTitle.json", JSON.stringify(indeedJobTitles));
    fs.writeFileSync("data/indeed/indeedRate.json", JSON.stringify(indeedRate));
    fs.writeFileSync("data/indeed/indeedDescription.json", JSON.stringify(indeedDescription));
    fs.writeFileSync("data/indeed/indeedImages.json", JSON.stringify(indeedImages));
    fs.writeFileSync("data/indeed/indeedLinks.json", JSON.stringify(indeedLinks));

    console.log("2");

    res.json({ message: "Scraped succefully ! " });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});


//Indeed
const indeedJobTitleFromJson = fs.readFileSync(
  "././data/indeed/indeedJobsTitle.json"
);

const indeedDescriptionFromJson = fs.readFileSync(
  "././data/indeed/indeedDescription.json"
);

const indeedRateFromJson = fs.readFileSync(
  "././data/indeed/indeedRate.json"
);

const indeedImageseFromJson = fs.readFileSync(
  "././data/indeed/indeedImages.json"
);

const indeedLinkFromJson = fs.readFileSync(
  "././data/indeed/indeedLinks.json"
);


// Indeed 
let indeedJobTitlesList = JSON.parse(indeedJobTitleFromJson);
let indeedDescriptionList = JSON.parse(indeedDescriptionFromJson);
let indeedJobRateList = JSON.parse(indeedRateFromJson);
let indeedImagesList = JSON.parse(indeedImageseFromJson);
let indeedLinksList = JSON.parse(indeedLinkFromJson);




//@author Ghada Khedri
//@route GET api/scrape/get-scraped-data-indeed
//@desc scrape jobs
//@access Private
router.get("/get-scraped-data-indeed", async (req, res) => {
  try {

    let scrapeList = [];


    for (let i = 0; i < 5; i++) {
      scrapeList.push({
        title: indeedJobTitlesList[i],
        description: indeedDescriptionList[i],
        rate: indeedJobRateList[i],
        image: indeedImagesList[i],
        link: indeedLinksList[i],
      });
    }
    res.json(scrapeList);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});



//@author Ghada Khedri
//@route GET api/scrape/scrape-udemy
//@desc scrape jobs
//@access Private
router.get("/scrape-udemy", async (req, res) => {
  try {
    console.log('udemy')
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.udemy.com/");
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cheerio.load(html);

    console.log("1");


    udemyImages = [];
    udemyJobsTitle = [];

    //carousel--scroll-item--3Wciz
    $(".course-card--image-wrapper--Sxd90").each((i, element) => {
      udemyImages.push($(element).find("img").attr("src"));
    });

    //udlite-focus-visible-target udlite-heading-md course-card--course-title--2f7tE
    $(".course-card--course-title--2f7tE").each((i, element) => {
      udemyJobsTitle.push($(element).text());
    });

    console.log("2");

    res.json(udemyJobsTitle);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});



module.exports = router;
