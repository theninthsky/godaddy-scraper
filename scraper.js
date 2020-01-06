const fs = require('fs');
const https = require('https');
const { question } = require('readline-sync');

console.log('\n*** GoDaddy Scraper ***\n')

const [fromIndex, toIndex] = [+question('Check from index: '), +question('To index: ')];

const domainNames = JSON.parse(fs.readFileSync('domain-names.json', 'utf-8')).slice(fromIndex, toIndex + 1);
const domains = [];

console.log();

(async () => {
    const promiseArray = [];

    for (const domainName of domainNames) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`${~~((domainNames.indexOf(domainName) + 1) / domainNames.length * 100)}%`);

        let data = '';

        promiseArray.push(new Promise(resolve => {
            https.get(`https://entourage.prod.aws.godaddy.com/domainsapi/v1/search/exact?q=${domainName}&key=dpp_search&pc=&ptl=&itc=dpp_absol1&req_id=1578304673372`, res => {
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const { ExactMatchDomain: { IsPurchasable, Price }, CurrentPriceDisplay } = JSON.parse(data);
                    domains.push([
                        fromIndex + domainNames.indexOf(domainName),
                        domainName,
                        (IsPurchasable ? Price || CurrentPriceDisplay.slice(1) : 'taken')
                    ].join`, `);
                    resolve();
                });
            });
        }));
    }

    await Promise.all(promiseArray);

    if (!fs.existsSync('scraped-domains.csv')) {
        fs.writeFileSync('scraped-domains.csv', 'Index, Domain (.com), Price ($)\n');
    }
    fs.appendFile('scraped-domains.csv', domains.sort((a, b) => +a.match(/\d+/)[0] - +b.match(/\d+/)[0]).join`\n` + '\n', () => { });

    const [startGreenColor, endColor] = ['\x1b[92m', '\x1b[0m'];

    console.log(`\n\nCompleted. Results are saved to file ${startGreenColor}scraped-domains.csv${endColor}.\n`);
})();