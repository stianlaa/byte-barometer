from flask import request, abort, jsonify
from pinecone_util import query


async def query_endpoint():
    data = request.get_json()

    # Get the 'query' field, defaulting to an empty string
    query_text = data.get('query')
    if not query_text:
        abort(400, 'Missing required field: query')
    comment_count = data.get('commentCount', 10)
    alpha = data.get('alpha', 0.5)

    result = await query(query_text, comment_count, alpha)
    return jsonify([match.to_dict() for match in result])
