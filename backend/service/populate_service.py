from action.populate_index import populate_index
from schedule import every


def schedule_populate_job(populate_interval: int = 1800):
    # Sensible limit to prevent
    document_limit = populate_interval * 5
    every(populate_interval).seconds.do(
        populate_index, last=populate_interval, document_limit=document_limit
    )
