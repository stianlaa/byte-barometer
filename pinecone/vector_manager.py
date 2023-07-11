from argparse import ArgumentParser
from api import query_endpoint
from pinecone_util import delete_if_exists, populate, query
from flask import Flask


def delete_action(args):
    print('Deleting index')
    delete_if_exists()


def populate_action(args):
    print('Populating index')
    populate()


def query_action(args):
    print('Querying index')
    subject = args.subject
    top_k = 1 if args.topK is None else args.topK
    alpha = 0.5 if args.alpha is None else args.alpha
    result = query(subject, top_k, alpha)
    print(result)


def serve_action(args):
    print('Serving index')
    app = Flask(__name__)
    app.route('/query', methods=['POST'])(query_endpoint)
    app.run()


options = {
    "serve": serve_action,
    "populate": populate_action,
    "delete": delete_action,
    "query": query_action,
}


def main():
    parser = ArgumentParser(prog='vector-manager',
                            description='Manages vector database data')

    parser.add_argument("action",
                        choices=["serve", "populate", "delete", "query"],
                        help="action to execute"
                        )
    parser.add_argument('-s', '--subject', type=str)
    parser.add_argument('-k', '--topK', type=int)
    parser.add_argument('-a', '--alpha', type=float)

    args = parser.parse_args()

    # get the function from options dictionary
    func = options.get(args.action)
    func(args)


if __name__ == '__main__':
    main()
