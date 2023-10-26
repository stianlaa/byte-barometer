class Comment:
    def __init__(
        self,
        id: str,
        story_id: str,
        author: str,
        story_url: str,
        comment_text: str,
        created_at: str,
        parent_id: int,
    ):
        self.id = id
        self.story_id = story_id
        self.author = author
        self.story_url = story_url
        self.comment_text = comment_text
        self.created_at = created_at
        self.parent_id = parent_id
