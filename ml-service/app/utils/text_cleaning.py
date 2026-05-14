def normalize_whitespace(text: str) -> str:
    return " ".join(text.split())


def clean_text_placeholder(text: str) -> str:
    return normalize_whitespace(text.strip())
