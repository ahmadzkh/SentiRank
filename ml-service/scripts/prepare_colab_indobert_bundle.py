"""Create a local IndoBERT dataset bundle for manual Google Colab upload."""

from __future__ import annotations

import argparse
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


DEFAULT_INPUT_DIR = Path("../datasets/processed/indobert")
DEFAULT_OUTPUT_DIR = Path("../datasets/outputs/colab")
DEFAULT_ARCHIVE_NAME = "indobert_dataset_bundle.zip"
REQUIRED_FILES = (
    "train.csv",
    "validation.csv",
    "test.csv",
    "label_mapping.json",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Bundle local IndoBERT split files for manual upload to Google Drive. "
            "This script does not upload files and does not train a model."
        )
    )
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--archive-name", default=DEFAULT_ARCHIVE_NAME)

    return parser.parse_args()


def validate_input_files(input_dir: Path) -> list[Path]:
    if not input_dir.is_dir():
        raise FileNotFoundError(f"Missing input directory: {input_dir}")

    required_paths = [input_dir / file_name for file_name in REQUIRED_FILES]
    missing_paths = [path for path in required_paths if not path.is_file()]

    if missing_paths:
        missing_list = ", ".join(str(path) for path in missing_paths)
        raise FileNotFoundError(f"Missing required bundle files: {missing_list}")

    return required_paths


def build_archive_path(output_dir: Path, archive_name: str) -> Path:
    if not archive_name.endswith(".zip"):
        raise ValueError("--archive-name must end with .zip")

    return output_dir / archive_name


def create_bundle(input_paths: list[Path], archive_path: Path) -> None:
    archive_path.parent.mkdir(parents=True, exist_ok=True)

    with ZipFile(archive_path, mode="w", compression=ZIP_DEFLATED) as archive:
        for input_path in input_paths:
            archive.write(input_path, arcname=input_path.name)


def main() -> None:
    args = parse_args()
    input_paths = validate_input_files(args.input_dir)
    archive_path = build_archive_path(args.output_dir, args.archive_name)

    create_bundle(input_paths, archive_path)

    print(f"Created Colab dataset bundle: {archive_path}")
    print("Upload this archive to Google Drive manually before running the Colab notebook.")


if __name__ == "__main__":
    main()
