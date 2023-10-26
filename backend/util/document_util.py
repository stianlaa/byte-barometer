from util.split_util import sentence_split_text
from service.hackernews_dto import Comment


class Document:
    def __init__(
        self,
        id: str,
        story_id: str,
        text: str,
        author: str,
        story_url: str,
        created_at: str,
        parent_id: int,
        text_location: int,
        comment_text: str,
    ):
        self.id = id
        self.story_id = story_id
        self.author = author
        self.story_url = story_url
        self.text = text
        self.created_at = created_at
        self.parent_id = parent_id
        self.text_location = text_location
        self.comment_text = comment_text


def create_documents(comments: list[Comment]) -> list[Document]:
    documents: list[Document] = []

    for comment in comments:
        chunks = sentence_split_text(comment.comment_text)
        # index of where the text in the document begins within the larger comment
        text_location = 0

        for chunk_index, chunk in enumerate(chunks):
            document_text = chunk.strip()
            documents.append(
                Document(
                    id=f"{comment.id}-{chunk_index}",
                    story_id=comment.story_id,
                    text=document_text,
                    author=comment.author,
                    story_url=comment.story_url,
                    created_at=comment.created_at,
                    parent_id=comment.parent_id,
                    text_location=text_location,
                    comment_text=comment.comment_text,
                )
            )
            text_location += len(document_text)

    return documents
