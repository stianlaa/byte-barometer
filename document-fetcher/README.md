# Document fetcher

The purpose of this application is to fetch a dataset, clean it into managable chunks and either write to file or to upload it to a target storage. The write to file functionality is intended for debugging and testing purposes

## Usage, population

The `populate-index.ts` file is used to populate the index. an initial large upsert for basic state is done manually for instance to 500 00 entries. The same script is used, but using the --last parameter to cover the last day. The entries will be upserted into the available vector database.

```bash
# To populate the index with entries from the last 86 400 seconds up to a max documentLimit of 20 000
npm run populate -- --last 86400 --documentLimit 10000
```

## Usage, file collection

```bash
# To fetch documents from the last 450 000 0 seconds up to a max documentLimit of 20 000
npm run collect -- --last 4500000 --documentLimit 20000

# To fetch from <epochTimestamp> to <epochTimestamp> up to a max documentLimit of 700
npm run collect -- --from 1698036000 --to 1698139000 --documentLimit 700
```
