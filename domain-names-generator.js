const fs = require('fs')
const { question } = require('readline-sync')
const { generate } = require('namor')

console.log('\n*** Domain Names Generator ***\n')

const [startDim, endDim] = ['\x1b[2m', '\x1b[0m']

const numOfNames = +question(`Number of names to generate: `)
const numOfWords = +question(
  `Number of words in a name ${startDim}(1, 2, 3, mix)${endDim}: `
)
const dashSeparated =
  numOfWords > 1 || Number.isNaN(numOfWords)
    ? question(`Separate names by dash ${startDim}(Y/n)${endDim}? `)
    : 'n'

const names = []

for (let i = 0; i < numOfNames; i++) {
  names.push(
    generate({ words: numOfWords || ~~(Math.random() * 3 + 1), saltLength: 0 })
  )
}

fs.writeFileSync(
  'domain-names.json',
  JSON.stringify(
    dashSeparated != 'n' ? names : names.map(name => name.replace(/-/g, ''))
  )
)

const [startGreenColor, endColor] = ['\x1b[92m', '\x1b[0m']

console.log(`\nCreated file ${startGreenColor}domain-names.json${endColor}.\n`)
