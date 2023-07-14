# Document fetcher

The purpose of this application is to fetch a dataset, clean it into managable chunks and write to file.

## Usage

```bash
# To fetch documents from the last 450 000 0 seconds up to a max count of 20 000
npm run populate -- -last 4500000 -count 20000

# To fetch from <epochTimestamp> to <epochTimestamp> up to a max count of 20 000
npm run populate -- -from 168916215 -to 168916215 -count 20000
```
