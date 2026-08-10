import logging
import sys


def configure_logging(app_env: str) -> None:
    level = logging.DEBUG if app_env == "development" else logging.INFO
    logging.basicConfig(
        level=level,
        stream=sys.stdout,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
