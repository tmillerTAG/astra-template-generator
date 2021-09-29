const { Connection } = require('jsforce')
const { randomElement } = require('./util')

class SalesforceClient {
  async initConnection() {
    const user = process.env.SALESFORCE_USERNAME
    const password = `${process.env.SALESFORCE_PASSWORD}${process.env.SALESFORCE_TOKEN}`
    const loginUrl = process.env.SALESFORCE_URL
    const conn = new Connection({ loginUrl })
  
    await conn.login(user, password)
  
    this.connection = conn
  }

  async getOwners() {
    const owners = await this.connection.query(
      'select Id, Property__c, Name, Purchase_Price__c, Fund__r.Name, Purchasing_Entity__r.Name, Property__r.Id, Property__r.MSR_Property_ID__c from Owner__c'
    )
    return owners.records
  }

  async getProperties() {
    const properties = await this.connection.query(
      'select Id, MSR_Property_ID__c, Purchase_Price__c, Fund__c, Purchasing_Entity__c from Property__c where Id not in (select Property__c from Owner__c)'
    )
    return properties.records
  }

  async getFundsWithPurchasingEntities() {
    const results = await this.connection.query(
      `select Id, Name, (select Id, Name, Purchasing_Entity_Short_Name__c from Purchasing_Entities__r) from Fund__c`
    )
    return results.records.map(fund => {
      const purchEntities = fund.Purchasing_Entities__r?.records ?? []
      return { ...fund, Purchasing_Entities__r: purchEntities }
    })
  }

  randomAssetCo(funds, fundName) {
    const fund = funds.find(fund => fund.Name === fundName)
    return randomElement(fund.Purchasing_Entities__r).Name
  }

  async getPropertiesForTemplate() {
    const owners = await this.getOwners()
    const properties = await this.getProperties()
    const funds = await this.getFundsWithPurchasingEntities()
    const dateOfSale = new Date()

    const recordsFromOwners = owners.map(o => {
      const sellingFund = o.Fund__r?.Name ?? 'Vaca Morada'
      const purchasingFund = sellingFund == 'Vaca Morada' ? 'ASFRP' : 'Vaca Morada'
      return {
        assetId: o.Property__r.MSR_Property_ID__c,
        dateOfSale,
        sellingFund,
        sellingAssetCo: o.Purchasing_Entity__r?.Name ?? 'MUPR 3 ASSETS, LLC',
        purchasingFund,
        purchasingAssetCo: this.randomAssetCo(funds, purchasingFund),
        purchasePrice: o.Purchase_Price__c ?? 300000,
      }
    })

    const recordsFromProperties = properties.map(p => {
      const sellingFund = p.Fund__c ?? 'Vaca Morada'
      const purchasingFund = sellingFund == 'Vaca Morada' ? 'ASFRP' : 'Vaca Morada'
      return {
        assetId: p.MSR_Property_ID__c,
        dateOfSale,
        sellingFund,
        sellingAssetCo: p.Purchasing_Entity__c ?? 'MUPR 3 ASSETS, LLC',
        purchasingFund,
        purchasingAssetCo: this.randomAssetCo(funds, purchasingFund),
        purchasePrice: p.Purchase_Price__c ?? 300000,
      }
    })
    
    return [...recordsFromOwners, ...recordsFromProperties].map(record => {
      return {
        ...record,
        acquisitionCosts: 0,
        remainingRepairs: 0,
        uwRent: 0,
        uwOtherRent: 0,
        uwRentConcessions: 0,
        uwAnnualTaxes: 0,
        uwAnnualHoa: 0,
        uwAnnualInsurance: 0,
        uwOccupancyPercentage: 0,
        uwCreditLoss: 0,
        uwMaintenance: 0,
        uwTurnover: 0,
        uwPropMgmtFees: 0,
        uwLeasingFees: 0,
      }
    })
  }
}

module.exports = new SalesforceClient()
