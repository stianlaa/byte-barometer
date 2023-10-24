import yargs from "yargs";

export const step = (current: number, to: number, stepSize: number) => {
  if (current + stepSize > to) return to;
  return current + stepSize;
};

export const sliceIntoChunks = <T>(arr: T[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize)
  );
};

export const getCommandLineArguments = () => {
  const argv = yargs(process.argv)
    .option("from", {
      alias: "f",
      type: "number",
      description: "lower time boundary in seconds to query for comments",
      demandOption: false,
    })
    .option("to", {
      alias: "t",
      type: "number",
      description: "upper time boundary in seconds to query for comments",
      demandOption: false,
    })
    .option("last", {
      alias: "l",
      type: "number",
      description:
        "sets 'from' to (now - last) and 'to' to now. Last is given in seconds",
      demandOption: false,
    })
    .option("documentLimit", {
      alias: "d",
      type: "number",
      description: "limit the number of documents to fetch",
      default: 100,
      demandOption: false,
    })
    .parseSync();

  const { from, to, last, documentLimit } = argv;

  if (last) {
    if (from || to) {
      console.error("Please provide only one of from, to, or last");
      process.exit(1);
    }
    if (last < 0) {
      console.error("Please provide a positive value for last");
      process.exit(1);
    }

    // Get now seconds since epoch
    const now = Math.floor(Date.now() / 1000);
    return { from: now - Math.floor(last), to: now, documentLimit };
  }

  if (!from || !to) {
    console.error("Please provide both from and to");
    process.exit(1);
  }

  return { from, to, documentLimit };
};
