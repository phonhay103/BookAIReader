import json


def load_model_config(config_file):
    with open(config_file, "r") as file:
        config = json.load(file)
    return config.get("models", {})


MODEL_CONFIG = load_model_config("models_config.json")
MODEL_NAMES = list(MODEL_CONFIG.keys())
