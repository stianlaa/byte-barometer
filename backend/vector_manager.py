from logger_setup import logger
from argparse import ArgumentParser
from processing.populate_index_util import populate
from processing.pinecone_util import (
    create_index_if_missing,
    delete_if_exists,
    run_query,
)


def delete_action():
    logger.info("Deleting index")
    delete_if_exists()


def create_action():
    create_index_if_missing()


def populate_action(args):
    logger.info("Populating index")
    last = 3600 if args.last is None else args.last
    documentLimit = 100 if args.documentLimit is None else args.documentLimit
    populate(last, documentLimit)


def query_action(args):
    logger.info("Querying index")
    subject = args.subject
    top_k = 1 if args.topK is None else args.topK
    alpha = 0.5 if args.alpha is None else args.alpha
    result = run_query(subject, top_k, alpha)
    logger.info([match.to_dict() for match in result])


def main():
    parser = ArgumentParser(
        prog="vector-manager", description="Manages vector database data"
    )

    parser.add_argument(
        "action", choices=["populate", "delete", "query"], help="action to execute"
    )
    parser.add_argument("-s", "--subject", type=str)
    parser.add_argument("-k", "--topK", type=int)
    parser.add_argument("-a", "--alpha", type=float)
    parser.add_argument("-l", "--last", type=int)
    parser.add_argument("-d", "--documentLimit", type=int)

    args = parser.parse_args()

    # get the function from options dictionary
    if args.action == "populate":
        populate_action(args)
    elif args.action == "delete":
        delete_action()
    elif args.action == "create":
        create_action()
    elif args.action == "query":
        query_action(args)
    else:
        raise Exception(f"Unknown action {args.action}")


if __name__ == "__main__":
    main()
