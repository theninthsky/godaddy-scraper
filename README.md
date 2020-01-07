# GoDaddy Scraper

![Logo](images/godaddy-logo.png)</br>

A Node.js script for retrieving domains and prices of randomly generated names.

The script guides you through generating random names in accordence to your preferences, then it lets your scrape these names from https://www.godaddy.com/ and saves the results to a CSV file.

## Usage
### npm start
Runs through <b>domains-names-generator.js</b> and then immidiately runs <b>scraper.js</b>.

You can also run them separately.

Beware not to scrape more than 250 domains at a time, or else you'll get a "Too many requests" error from the server.

![Results](images/results.png)