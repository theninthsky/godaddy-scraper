const fs = require('fs');

const names = [];
const adjectives = JSON.parse(fs.readFileSync('english-vocabulary/adjectives.json', 'utf-8'));
const nouns = JSON.parse(fs.readFileSync('english-vocabulary/nouns.json', 'utf-8'));

for (const adjective of adjectives) {
    for (const noun of nouns) {
        names.push(adjective + noun);
    }
}

fs.writeFileSync('domain-names.json', JSON.stringify(names));

const [startGreenColor, endColor] = ['\x1b[92m', '\x1b[0m'];

console.log(`\nCreated file ${startGreenColor}domain-names.json${endColor}.\n`)