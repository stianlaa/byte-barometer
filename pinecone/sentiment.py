from transformers import pipeline
from dotenv import load_dotenv

sentiment_model_id = "yangheng/deberta-v3-large-absa-v1.1"

load_dotenv("../.env")


class Toolbox:
    _sentiment_pipeline = None

    @property
    def sentiment_pipeline(self):
        if self._sentiment_pipeline is None:
            self._sentiment_pipeline = pipeline(
                "text-classification", model=sentiment_model_id)
        return self._sentiment_pipeline


toolbox = Toolbox()


def infer_sentiment(chunktext, aspect):
    # Append aspect to each document
    masked_text = list(
        map(lambda text: f"[CLS] {text} [SEP] {aspect} [SEP]", chunktext))

    # Infer sentiment
    return toolbox.sentiment_pipeline(masked_text)
