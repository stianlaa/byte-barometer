from argparse import ArgumentParser
from api import query_endpoint
from pinecone_util import delete_if_exists, populate, query
from flask import Flask
from flask_cors import CORS
import asyncio


async def delete_action(args):
    print('Deleting index')
    await delete_if_exists()


async def populate_action(args):
    print('Populating index')
    await populate()


async def query_action(args):
    print('Querying index')
    subject = args.subject
    top_k = 1 if args.topK is None else args.topK
    alpha = 0.5 if args.alpha is None else args.alpha
    result = await query(subject, top_k, alpha)
    print([match.to_dict() for match in result])


async def serve_action(args):
    print('Serving index')
    app = Flask(__name__)
    # CORS
    CORS(app)
    app.route('/query', methods=['POST'])(query_endpoint)
    app.run()


options = {
    "serve": serve_action,
    "populate": populate_action,
    "delete": delete_action,
    "query": query_action,
}


async def main():
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
    await func(args)


if __name__ == '__main__':
    asyncio.run(main())
