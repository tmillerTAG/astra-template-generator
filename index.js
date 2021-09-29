require('dotenv').config()
const salesforce = require('./salesforce-client')
const { convertToWorkbook } = require('./template')
const fs = require('fs')

async function initialize() {
  await salesforce.initConnection()
}

async function go() {
  await initialize()

  const records = await salesforce.getPropertiesForTemplate()
  
  const workbook = convertToWorkbook(records)

  await fs.promises.writeFile('output/transfer.xlsx', workbook)
}

go()
