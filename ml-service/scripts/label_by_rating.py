"""Apply initial rating-based sentiment labels to raw SentiRank reviews."""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

SENTIMENT_BY_RATING = {
    1: "Negative",
    2: "Negative",
    3: "Neutral",
    4: "Positive",
    5: "Positive",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Assign initial sentiment labels from numeric Google Play ratings. "
            "Ratings 1-2 are Negative, rating 3 is Neutral, and ratings 4-5 "
            "are Positive."
        )
    )
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--rating-column", default="rating")
    parser.add_argument("--label-column", default="sentiment_label")

    return parser.parse_args()


def label_from_rating(rating: object) -> str:
    try:
        rating_value = int(rating)
    except (TypeError, ValueError) as error:
        raise ValueError(f"Invalid rating value: {rating!r}") from error

    if rating_value not in SENTIMENT_BY_RATING:
        raise ValueError(f"Rating must be between 1 and 5: {rating_value}")

    return SENTIMENT_BY_RATING[rating_value]


def apply_initial_labels(
    dataframe: pd.DataFrame,
    rating_column: str,
    label_column: str,
) -> pd.DataFrame:
    if rating_column not in dataframe.columns:
        raise ValueError(f"Missing required rating column: {rating_column}")

    labeled_dataframe = dataframe.copy()
    labeled_dataframe[label_column] = labeled_dataframe[rating_column].map(
        label_from_rating
    )

    return labeled_dataframe


def main() -> None:
    args = parse_args()

    if not args.input.is_file():
        raise FileNotFoundError(f"Input CSV does not exist: {args.input}")

    dataframe = pd.read_csv(args.input)
    labeled_dataframe = apply_initial_labels(
        dataframe=dataframe,
        rating_column=args.rating_column,
        label_column=args.label_column,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    labeled_dataframe.to_csv(args.output, index=False)
    print(f"Wrote labeled reviews to {args.output}")


if __name__ == "__main__":
    main()
