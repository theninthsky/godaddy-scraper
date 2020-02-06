const fs = require('fs')
const https = require('https')
const { question } = require('readline-sync')

console.log('\n*** GoDaddy Scraper ***\n')

const domainNames = JSON.parse(
  fs.readFileSync(`${__dirname}/util/domain-names.json`, 'utf-8')
)

const [startDim, endDim] = ['\x1b[2m', '\x1b[0m']

const fromIndex = +question(
  `Search from index ${startDim}(default 0)${endDim}: `
)
const toIndex = +question(
  `To index ${startDim}(default ${fromIndex + 249})${endDim}: `
)

const filteredDomainNames = domainNames.slice(
  fromIndex || 0,
  toIndex ? toIndex + 1 : fromIndex + 249 + 1
)

const domains = []

console.log()

const startScraping = async () => {
  const promiseArray = []
  let completed = 0

  for (const domainName of filteredDomainNames) {
    let data = ''

    promiseArray.push(
      new Promise(resolve => {
        https.get(
          `https://entourage.prod.aws.godaddy.com/domainsapi/v1/search/exact?q=${domainName}&key=dpp_search&pc=&ptl=&itc=dpp_absol1&req_id=1578304673372`,
          res => {
            res.on('data', chunk => (data += chunk))
            res.on('end', () => {
              const {
                ExactMatchDomain: { IsPurchasable, Price },
                CurrentPriceDisplay
              } = JSON.parse(data)
              domains.push(
                [
                  domainNames.indexOf(domainName),
                  domainName,
                  IsPurchasable
                    ? Price || CurrentPriceDisplay.slice(1)
                    : 'taken'
                ].join`, `
              )

              process.stdout.clearLine()
              process.stdout.cursorTo(0)
              process.stdout.write(
                `${~~((completed / (filteredDomainNames.length - 1)) * 100)}%`
              )
              completed++

              resolve()
            })
          }
        )
      })
    )
  }

  await Promise.all(promiseArray)

  if (!fs.existsSync(`${__dirname}/results.csv`)) {
    fs.writeFileSync(
      `${__dirname}/results.csv`,
      'Index, Domain (.com), Price ($)\n'
    )
  }
  fs.appendFile(
    `${__dirname}/results.csv`,
    domains.sort((a, b) => +a.match(/\d+/)[0] - +b.match(/\d+/)[0]).join`\n` +
      '\n',
    () => {}
  )

  const [startGreenColor, endColor] = ['\x1b[92m', '\x1b[0m']

  console.log(
    `\n\nCompleted. Results are saved to file ${startGreenColor}scraped-domains.csv${endColor}.\n`
  )
}

startScraping()
