class Metadata:
    def __init__(self, context: str):
        self.context = context

    def to_dict(self):
        return {"context": self.context}


class QueryResponse:
    def __init__(self, id: str, score: float, metadata: dict):
        self.id = id
        self.score = score
        self.metadata = metadata

    def to_dict(self):
        return {
            "id": self.id,
            "score": self.score,
            "metadata": self.metadata,
        }


class Match:
    def __init__(self, query_response: QueryResponse, sentiment: dict):
        self.id = query_response.id
        self.score = query_response.score
        self.metadata = query_response.metadata
        self.sentiment = sentiment

    def to_dict(self):
        return {
            "id": self.id,
            "score": self.score,
            "sentiment": self.sentiment,
            "metadata": self.metadata,
        }
