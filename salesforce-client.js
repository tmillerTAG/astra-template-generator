const { Connection } = require('jsforce')

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
      'select Id, Property__c, Name, Purchase_Price__c, Fund__c, Purchasing_Entity__c, Property__r.Id, Property__r.MSR_Property_ID__c from Owner__c'
    )
    return owners.records
  }

  async getProperties() {
    const properties = await this.connection.query(
      'select Id, MSR_Property_ID__c, Purchase_Price__c, Fund__c, Purchasing_Entity__c from Property__c where Id not in (select Property__c from Owner__c)'
    )
    return properties.records
  }

  async getPropertiesForTemplate() {
    const owners = await this.getOwners()
    const properties = await this.getProperties()
    const dateOfSale = new Date()

    const recordsFromOwners = owners.map(o => {
      return {
        assetId: o.Property__r.MSR_Property_ID__c,
        dateOfSale,
        sellingFund: o.Fund__c ?? 'Vaca Morada',
        sellingAssetCo: o.Purchasing_Entity__c ?? 'MUPR 3 ASSETS, LLC',
        purchasingFund: '',
        purchasingAssetCo: '',
        purchasePrice: o.Purchase_Price__c ?? 300000,
      }
    })

    const recordsFromProperties = properties.map(p => {
      return {
        assetId: p.MSR_Property_ID__c,
        dateOfSale,
        sellingFund: p.Fund__c ?? 'Vaca Morada',
        sellingAssetCo: p.Purchasing_Entity__c ?? 'MUPR 3 ASSETS, LLC',
        purchasingFund: '',
        purchasingAssetCo: '',
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

  async getValidMsrPropertyIds() {
    const properties = await this.getProperties()
    return properties.map(property => property.Property__r.MSR_Property_ID__c)
  }
}

module.exports = new SalesforceClient()
