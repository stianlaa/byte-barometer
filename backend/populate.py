from dotenv import load_dotenv

load_dotenv("../.env")

from logger_setup import logger
from argparse import ArgumentParser
from action.populate_index import populate_index
from service.pinecone_client import create_index_if_missing


def populate(args):
    create_index_if_missing()

    logger.info("Populating index")
    last = 3600 if args.last is None else args.last
    documentLimit = 100 if args.documentLimit is None else args.documentLimit
    populate_index(last, documentLimit)


def main():
    parser = ArgumentParser(
        prog="populate-byte-barometer",
        description="Utility for creating and populating vector db indices",
    )

    parser.add_argument("-l", "--last", type=int)
    parser.add_argument("-d", "--documentLimit", type=int)

    args = parser.parse_args()

    populate(args)


if __name__ == "__main__":
    main()
