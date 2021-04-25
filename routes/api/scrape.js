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
    await page.goto("https://stackoverflow.com/jobs?pg=10");
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
//@route GET api/scrape/scrape-stackoverflow
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

module.exports = router;
