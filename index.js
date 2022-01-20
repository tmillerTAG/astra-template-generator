require('dotenv').config()
const initSalesforce = require('./salesforce')
const { convertToWorkbook } = require('./template')
const fs = require('fs')

async function go() {
  const recordLimit = process.argv[2]
  const salesforce = await initSalesforce()

  const records = await salesforce.getPropertiesForTemplate(recordLimit)
  const workbook = convertToWorkbook(records)

  await fs.promises.writeFile('output/transfer.xlsx', workbook)
}

go()
