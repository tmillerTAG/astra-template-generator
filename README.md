# Astra Template Generator
Builds transfer templates using Salesforce data for testing purposes.

## Setup

### Env
Create a `.env` file using `.env.example` for reference.

### Install dependencies
`yarn`

### Run it
`node index.js {numberOfRecords?}` i.e. `node index.js 40`. This will build a file with the desired number of records and will drop it in the `output` directory. The number of records argument is optional.