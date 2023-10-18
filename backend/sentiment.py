from transformers import pipeline
from dotenv import load_dotenv

sentiment_model_id = "yangheng/deberta-v3-large-absa-v1.1"

# Should only be neccessary in initial model download, afterwards huggingface key should be obsolete.
load_dotenv("../.env")


class Toolbox:
    def __init__(self):
        print("Initializing sentiment toolbox")
        self._sentiment_pipeline = pipeline(
            "text-classification", model=sentiment_model_id, device=0)

    @property
    def sentiment_pipeline(self):
        return self._sentiment_pipeline


toolbox = Toolbox()


def infer_sentiment(chunktext, aspect):
    # Append aspect to each document
    masked_text = list(
        map(lambda text: f"[CLS] {text} [SEP] {aspect} [SEP]", chunktext))

    # Infer sentiment
    sentiment = toolbox.sentiment_pipeline(masked_text)
    return sentiment
