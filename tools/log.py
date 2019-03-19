import json
import logging.config
import os

def setup_logging(default_path="logconfig.json", default_level=logging.INFO, env_key="LOG_CFG"):
    path = os.path.join(os.path.dirname(__file__),default_path)
    value = os.getenv(env_key, None)
    if value:
        path = value
    if os.path.exists(path):
        with open(path, "r") as f:
            config = json.load(f)
            logging.config.dictConfig(config)
    else:
        logging.basicConfig(level=default_level)


def get_logger(default_name=__name__):
    logger = logging.getLogger(default_name)
    return logger


if __name__ == "__main__":
    setup_logging(default_path="logconfig.json")
    get_logger()