from logger_setup import logger
from transformers import pipeline
from os import environ

# Suppress the warning from transformers, since it is not strictly relevant right now
# This is to filter UserWarning: You seem to be using the pipelines sequentially on GPU.
# from warnings import filterwarnings
# filterwarnings("ignore", category=UserWarning, module="transformers")

SENTIMENT_MODEL_ID = "yangheng/deberta-v3-large-absa-v1.1"


class Toolbox:
    def __init__(self):
        self._sentiment_pipeline = None
        self._lazy = environ.get("LAZY_INIT_MODELS", "False") == "True"

        if not self._lazy:
            self._initialize_pipeline()

    def _initialize_pipeline(self):
        if environ.get("ENABLE_GPU", "False") == "True":
            logger.info("Initializing sentiment toolbox with GPU")
            self._sentiment_pipeline = pipeline(
                "text-classification", model=SENTIMENT_MODEL_ID, device=0
            )
        else:
            logger.info("Initializing sentiment toolbox with CPU")
            self._sentiment_pipeline = pipeline(
                "text-classification", model=SENTIMENT_MODEL_ID
            )

    @property
    def sentiment_pipeline(self):
        if self._lazy and self._sentiment_pipeline is None:
            self._initialize_pipeline()
        return self._sentiment_pipeline


toolbox = Toolbox()


def infer_sentiment(chunktext, aspect):
    # Append aspect to each document
    masked_text = list(
        map(lambda text: f"[CLS] {text} [SEP] {aspect} [SEP]", chunktext)
    )

    # Infer sentiment
    return toolbox.sentiment_pipeline(masked_text)
