const fs = require('fs');

const names = [];
const adjectives = JSON.parse(fs.readFileSync('english-vocabulary/adjectives.txt', 'utf-8'));
const nouns = JSON.parse(fs.readFileSync('english-vocabulary/nouns.txt', 'utf-8'));

for (const adjective of adjectives) {
    for (const noun of nouns) {
        names.push(adjective + noun);
    }
}

fs.writeFile('names.txt', names, () => { });