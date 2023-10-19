from app_setup import logger
from transformers import pipeline
from dotenv import load_dotenv
from warnings import filterwarnings

sentiment_model_id = "yangheng/deberta-v3-large-absa-v1.1"

# Should only be neccessary in initial model download, afterwards huggingface key should be obsolete.
load_dotenv("../.env")

# Suppress the warning from transformers, since it is not strictly relevant right now
# This is to filter UserWarning: You seem to be using the pipelines sequentially on GPU.
filterwarnings("ignore", category=UserWarning, module="transformers")


class Toolbox:
    def __init__(self):
        logger.info('Initializing sentiment toolbox')
        # CPU
        self._sentiment_pipeline = pipeline(
            "text-classification", model=sentiment_model_id)
        # GPU
        # self._sentiment_pipeline = pipeline(
        # "text-classification", model=sentiment_model_id, device=0)

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
