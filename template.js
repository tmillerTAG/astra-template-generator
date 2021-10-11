const xlsx = require('xlsx')

module.exports = {
  convertToWorkbook(records) {
    const workbook = xlsx.utils.book_new()
    const sheet = xlsx.utils.json_to_sheet(records)
    xlsx.utils.book_append_sheet(workbook, sheet, 'transfers')

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return buffer
  },
}
