const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const scrapeJobStackoverflow = require("../../utils/stackoverflowScraper");
const fs = require("fs");
const jobTitle = fs.readFileSync("././data/stackoverflow/jobTitles.json");
const aboutJob = fs.readFileSync("././data/stackoverflow/aboutJob.json");
const jobImage = fs.readFileSync("././data/stackoverflow/jobImage.json");

let listOfJobsST = JSON.parse(jobTitle);
let listOfaboutJobST = JSON.parse(aboutJob);
let listOfjobImageST = JSON.parse(jobImage);

//To change the page of the jobs use query params ?pg=n (n is the number of the page you want to scrape)

//@author Ghada Khedri
//@route GET api/scrape/scrape-stackoverflow
//@desc scrape jobs
//@access Private
router.get("scrape-stackoverflow", auth, async (req, res) => {
  scrapeJobStackoverflow("https://stackoverflow.com/jobs?pg=2");
});

//@author Ghada Khedri
//@route GET api/scrape/scrape-stackoverflow
//@desc scrape jobs
//@access Private
router.get("/get-scraped-data-stackoverflow", auth, async (req, res) => {
  try {
    let scrapeList = [];
    let scrapeType = [];
    let scrapeExperience = [];

    for (let i = 0; i < listOfaboutJobST.length; i += 6) {
      scrapeType.push(listOfaboutJobST[i]);
    }

    for (let i = 1; i < listOfaboutJobST.length; i += 6) {
      scrapeExperience.push(listOfaboutJobST[i]);
    }

    for (let i = 0; i < 5; i++) {
      scrapeList.push({
        title: listOfJobsST[i],
        image: listOfjobImageST[i],
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
