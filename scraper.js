const fs = require('fs');
const { question } = require('readline-sync');
const puppeteer = require('puppeteer');

const currencyList = '$¢£¤¥֏؋߾߿৲৳৻૱௹฿៛₠₡₢₣₤₥₦₧₨₩₪₫€₭₮₯₰₱₲₳₴₵₶₷₸₹₺₻₼₽₾₿꠸﷼﹩＄￠￡￥￦𑿝𑿞𑿟𑿠𞋿𞲰';
const selector = '.exact-body-result';

console.log('\n*** GoDaddy Scraper ***\n')

const [fromIndex, toIndex] = [+question('Check from index: '), +question('To index: ')];
const numOfDomains = toIndex - fromIndex + 1;

let numOfThreads = +question('How many threads to use? (default: 1, max: 4): ') || 1;
if (numOfThreads > 4) {
    numOfThreads = 4;
} else if (numOfThreads < 1) {
    numOfThreads = 1;
}
if (numOfThreads > numOfDomains) {
    numOfThreads = numOfDomains;
}

const indexesPerThread = ~~(numOfDomains / numOfThreads);
const remainder = numOfDomains % numOfThreads;

const domainNames = fs.readFileSync('english-names.txt', 'utf-8').split`,`;
const domains = [];

console.log('');

const fetchData = async (page, url, index) => {
    await page.goto(url);
    await page.waitForSelector(selector, { timeout: 10000 });
    const result = await page.evaluate(selector => document.querySelector(selector).textContent, selector);
    domains.push(`\
        ${index},\
        ${result.split` `[0]},\
        ${(result.match(new RegExp(`(?<=[${currencyList}])[\\d,.]+|taken`)))[0].replace(',', '')},\
        ${(result.match(new RegExp(`[${currencyList}]`)) || ['-'])[0]}\
    `);
};

const thread = async (page, startInd, endInd) => {
    for (let ind = startInd; ind <= endInd; ind++) {
        console.log(`Checking ${domainNames[ind]}.com...`);
        await fetchData(page, `https://www.godaddy.com/domainsearch/find?checkAvail=1&tmskey=&domainToCheck=${domainNames[ind]}`, ind + 1);
    }
};

(async () => {
    const time = Date.now();
    const browser = await puppeteer.launch();

    const ranges = [];
    for (let i = fromIndex - 1; i <= toIndex - 1 - remainder; i += indexesPerThread) {
        ranges.push([i, i + indexesPerThread + (ranges.length < numOfThreads - 1 ? 0 : remainder) - 1]);
    }

    const threads = [];
    for (let threadIndex = 0; threadIndex < numOfThreads; threadIndex++) {
        threads.push(browser.newPage().then(page => thread(page, ...ranges[threadIndex])));
    }

    await Promise.all(threads);
    browser.close();
    if (!fs.existsSync('domains.csv')) {
        fs.writeFileSync('domains.csv', 'INDEX,DOMAIN,PRICE,CURRENCY\n');
    }
    fs.appendFile('domains.csv', domains.sort((a, b) => +a.match(/\d+/)[0] - +b.match(/\d+/)[0]).join`\n` + '\n', () => { });

    console.log(`\nCompleted in ${((Date.now() - time) / 1000).toFixed(2)}s. Logs are saved to file "domains.csv".\n`);
})();