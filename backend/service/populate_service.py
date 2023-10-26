from action.populate_index import populate
import time
import schedule
import threading


def run_continuously(interval=1):
    cease_continuous_run = threading.Event()

    class ScheduleThread(threading.Thread):
        @classmethod
        def run(cls):
            while not cease_continuous_run.is_set():
                schedule.run_pending()
                time.sleep(interval)

    continuous_thread = ScheduleThread()
    continuous_thread.start()
    return cease_continuous_run


def schedule_populate_job(populate_interval: int = 1800):
    # Sensible limit to prevent
    document_limit = populate_interval * 5
    schedule.every(populate_interval).seconds.do(
        populate, last=populate_interval, document_limit=document_limit
    )

    run_continuously()
