class StoryItem:
    def __init__(
        self,
        object_id: str,
        title: str,
        points: int,
        url: str,
        num_comments: int,
        created_at: str,
    ):
        self.object_id = object_id
        self.title = title
        self.points = points
        self.url = url
        self.num_comments = num_comments
        self.created_at = created_at


class CommentItem:
    def __init__(
        self,
        object_id: str,
        author: str,
        story_url: str,
        comment_text: str,
        created_at: str,
        parent_id: int,
    ):
        self.object_id = object_id
        self.author = author
        self.story_url = story_url
        self.comment_text = comment_text
        self.created_at = created_at
        self.parent_id = parent_id


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
    ):
        self.id = id
        self.story_id = story_id
        self.author = author
        self.story_url = story_url
        self.text = text
        self.created_at = created_at
        self.parent_id = parent_id
