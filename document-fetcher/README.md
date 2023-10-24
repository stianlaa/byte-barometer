# Document fetcher

The purpose of this application is to fetch a dataset, clean it into managable chunks and either write to file or to upload it to a target storage. The write to file functionality is intended for debugging and testing purposes

## Usage, population

## Usage, file collection

```bash
# To fetch documents from the last 450 000 0 seconds up to a max commentLimit of 20 000
npm run collect -- --last 4500000 --commentLimit 20000

# To fetch from <epochTimestamp> to <epochTimestamp> up to a max commentLimit of 700
npm run collect -- --from 1698036000 --to 1698139000 --commentLimit 700
```
