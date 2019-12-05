const fs = require('fs');

console.log('\n*** Sorts Domains By Price ***\n');

const domains = fs.readFileSync('domains.txt', 'utf-8').split`\n\n`.slice(0, -1);

console.log('Sorting...\n');

const sortedDomains = domains.filter(domain => !/ taken$/.test(domain)).sort((a, b) =>
    +a.match(/[\d,.]+$/)[0].replace(/[,.]/g, '') - +b.match(/[\d,.]+$/)[0].replace(/[,.]/g, ''));

fs.writeFile('domains-by-price.txt', sortedDomains.join`\n\n` + '\n\n', () => { });

console.log('Completed. Created file "domains-by-price.txt."\n');