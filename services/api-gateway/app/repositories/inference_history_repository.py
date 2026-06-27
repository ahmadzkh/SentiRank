"""Persistence for runtime review inference history.

The database is intentionally limited to user-submitted runtime inference
history. Research CSV/JSON artifacts remain file-based thesis outputs.
"""

from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


TABLE_NAME = "runtime_review_inference_history"


class InferencePersistenceError(Exception):
    """Raised when runtime inference history cannot be persisted or read."""


@dataclass
class InferenceRecord:
    id: str
    input_text: str
    sentiment_label: str | None
    sentiment_confidence: float | None
    sentiment_probabilities: dict[str, Any]
    sentiment_model_name: str | None
    sentiment_mode: str | None
    sentiment_prediction_source: str | None
    sentiment_model_available: bool
    sentiment_is_fallback: bool
    aspect_label: str | None
    aspect_confidence: float | None
    aspect_scores: dict[str, Any]
    aspect_model_name: str | None
    aspect_mode: str | None
    aspect_prediction_source: str | None
    aspect_model_available: bool
    aspect_is_fallback: bool
    created_at: str
    request_source: str = "web"
    warnings: list[str] = field(default_factory=list)


class InferenceHistoryRepository:
    """Small SQL repository for runtime inference history.

    PostgreSQL is used in Docker through API_GATEWAY_DATABASE_URL. SQLite is
    supported for local tests and thesis-stage development.
    """

    def __init__(self, database_url: str) -> None:
        self.database_url = database_url

    def save(self, record: InferenceRecord) -> InferenceRecord:
        try:
            if self._is_postgres:
                self._save_postgres(record)
            else:
                self._save_sqlite(record)
        except Exception as error:  # pragma: no cover - normalized boundary
            raise InferencePersistenceError(str(error)) from error
        return record

    def list_latest(self, limit: int) -> list[dict[str, Any]]:
        try:
            rows = self._list_latest_postgres(limit) if self._is_postgres else self._list_latest_sqlite(limit)
        except Exception as error:  # pragma: no cover - normalized boundary
            raise InferencePersistenceError(str(error)) from error
        return [self._row_to_history_item(row) for row in rows]

    def check_ready(self) -> dict[str, Any]:
        try:
            if self._is_postgres:
                self._ensure_postgres_schema()
            else:
                self._ensure_sqlite_schema()
        except Exception as error:  # pragma: no cover - normalized boundary
            return {
                "ready": False,
                "database": self._database_kind,
                "error": str(error),
            }
        return {
            "ready": True,
            "database": self._database_kind,
            "table": TABLE_NAME,
        }

    @property
    def _is_postgres(self) -> bool:
        return self.database_url.startswith(("postgresql://", "postgres://"))

    @property
    def _database_kind(self) -> str:
        return "postgresql" if self._is_postgres else "sqlite"

    def _sqlite_path(self) -> str:
        if self.database_url == "sqlite:///:memory:":
            return ":memory:"
        if self.database_url.startswith("sqlite:///"):
            path = self.database_url.removeprefix("sqlite:///")
        elif self.database_url.startswith("file:"):
            path = self.database_url.removeprefix("file:")
        else:
            path = self.database_url

        resolved = Path(path)
        if not resolved.is_absolute():
            resolved = Path.cwd() / resolved
        resolved.parent.mkdir(parents=True, exist_ok=True)
        return str(resolved)

    def _sqlite_connection(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self._sqlite_path())
        connection.row_factory = sqlite3.Row
        return connection

    def _ensure_sqlite_schema(self) -> None:
        with self._sqlite_connection() as connection:
            connection.execute(
                f"""
                CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                    id TEXT PRIMARY KEY,
                    input_text TEXT NOT NULL,
                    sentiment_label TEXT,
                    sentiment_confidence REAL,
                    sentiment_probabilities TEXT NOT NULL,
                    sentiment_model_name TEXT,
                    sentiment_mode TEXT,
                    sentiment_prediction_source TEXT,
                    sentiment_model_available INTEGER NOT NULL,
                    sentiment_is_fallback INTEGER NOT NULL,
                    aspect_label TEXT,
                    aspect_confidence REAL,
                    aspect_scores TEXT NOT NULL,
                    aspect_model_name TEXT,
                    aspect_mode TEXT,
                    aspect_prediction_source TEXT,
                    aspect_model_available INTEGER NOT NULL,
                    aspect_is_fallback INTEGER NOT NULL,
                    warnings TEXT NOT NULL,
                    request_source TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            connection.execute(
                f"CREATE INDEX IF NOT EXISTS idx_{TABLE_NAME}_created_at ON {TABLE_NAME}(created_at)"
            )

    def _save_sqlite(self, record: InferenceRecord) -> None:
        self._ensure_sqlite_schema()
        with self._sqlite_connection() as connection:
            connection.execute(
                f"""
                INSERT INTO {TABLE_NAME} (
                    id,
                    input_text,
                    sentiment_label,
                    sentiment_confidence,
                    sentiment_probabilities,
                    sentiment_model_name,
                    sentiment_mode,
                    sentiment_prediction_source,
                    sentiment_model_available,
                    sentiment_is_fallback,
                    aspect_label,
                    aspect_confidence,
                    aspect_scores,
                    aspect_model_name,
                    aspect_mode,
                    aspect_prediction_source,
                    aspect_model_available,
                    aspect_is_fallback,
                    warnings,
                    request_source,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                self._record_values(record, sqlite=True),
            )

    def _list_latest_sqlite(self, limit: int) -> list[sqlite3.Row]:
        self._ensure_sqlite_schema()
        with self._sqlite_connection() as connection:
            return list(
                connection.execute(
                    f"""
                    SELECT *
                    FROM {TABLE_NAME}
                    ORDER BY created_at DESC
                    LIMIT ?
                    """,
                    (limit,),
                )
            )

    def _postgres_connection(self):
        try:
            import psycopg
        except ImportError as error:  # pragma: no cover - depends on runtime image
            raise InferencePersistenceError(
                "psycopg is required for PostgreSQL runtime inference persistence."
            ) from error
        return psycopg.connect(self.database_url)

    def _ensure_postgres_schema(self) -> None:
        with self._postgres_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"""
                    CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                        id TEXT PRIMARY KEY,
                        input_text TEXT NOT NULL,
                        sentiment_label TEXT,
                        sentiment_confidence DOUBLE PRECISION,
                        sentiment_probabilities TEXT NOT NULL,
                        sentiment_model_name TEXT,
                        sentiment_mode TEXT,
                        sentiment_prediction_source TEXT,
                        sentiment_model_available BOOLEAN NOT NULL,
                        sentiment_is_fallback BOOLEAN NOT NULL,
                        aspect_label TEXT,
                        aspect_confidence DOUBLE PRECISION,
                        aspect_scores TEXT NOT NULL,
                        aspect_model_name TEXT,
                        aspect_mode TEXT,
                        aspect_prediction_source TEXT,
                        aspect_model_available BOOLEAN NOT NULL,
                        aspect_is_fallback BOOLEAN NOT NULL,
                        warnings TEXT NOT NULL,
                        request_source TEXT NOT NULL,
                        created_at TIMESTAMPTZ NOT NULL
                    )
                    """
                )
                cursor.execute(
                    f"CREATE INDEX IF NOT EXISTS idx_{TABLE_NAME}_created_at ON {TABLE_NAME}(created_at)"
                )
            connection.commit()

    def _save_postgres(self, record: InferenceRecord) -> None:
        self._ensure_postgres_schema()
        with self._postgres_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"""
                    INSERT INTO {TABLE_NAME} (
                        id,
                        input_text,
                        sentiment_label,
                        sentiment_confidence,
                        sentiment_probabilities,
                        sentiment_model_name,
                        sentiment_mode,
                        sentiment_prediction_source,
                        sentiment_model_available,
                        sentiment_is_fallback,
                        aspect_label,
                        aspect_confidence,
                        aspect_scores,
                        aspect_model_name,
                        aspect_mode,
                        aspect_prediction_source,
                        aspect_model_available,
                        aspect_is_fallback,
                        warnings,
                        request_source,
                        created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    self._record_values(record, sqlite=False),
                )
            connection.commit()

    def _list_latest_postgres(self, limit: int) -> list[dict[str, Any]]:
        self._ensure_postgres_schema()
        with self._postgres_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"""
                    SELECT
                        id,
                        input_text,
                        sentiment_label,
                        sentiment_confidence,
                        sentiment_probabilities,
                        sentiment_model_name,
                        sentiment_mode,
                        sentiment_prediction_source,
                        sentiment_model_available,
                        sentiment_is_fallback,
                        aspect_label,
                        aspect_confidence,
                        aspect_scores,
                        aspect_model_name,
                        aspect_mode,
                        aspect_prediction_source,
                        aspect_model_available,
                        aspect_is_fallback,
                        warnings,
                        request_source,
                        created_at
                    FROM {TABLE_NAME}
                    ORDER BY created_at DESC
                    LIMIT %s
                    """,
                    (limit,),
                )
                columns = [description.name for description in cursor.description]
                return [dict(zip(columns, row, strict=True)) for row in cursor.fetchall()]

    def _record_values(self, record: InferenceRecord, sqlite: bool) -> tuple[Any, ...]:
        return (
            record.id,
            record.input_text,
            record.sentiment_label,
            record.sentiment_confidence,
            json.dumps(record.sentiment_probabilities, ensure_ascii=True),
            record.sentiment_model_name,
            record.sentiment_mode,
            record.sentiment_prediction_source,
            int(record.sentiment_model_available) if sqlite else record.sentiment_model_available,
            int(record.sentiment_is_fallback) if sqlite else record.sentiment_is_fallback,
            record.aspect_label,
            record.aspect_confidence,
            json.dumps(record.aspect_scores, ensure_ascii=True),
            record.aspect_model_name,
            record.aspect_mode,
            record.aspect_prediction_source,
            int(record.aspect_model_available) if sqlite else record.aspect_model_available,
            int(record.aspect_is_fallback) if sqlite else record.aspect_is_fallback,
            json.dumps(record.warnings, ensure_ascii=True),
            record.request_source,
            record.created_at,
        )

    def _row_to_history_item(self, row: sqlite3.Row | dict[str, Any]) -> dict[str, Any]:
        item = dict(row)
        return {
            "id": item["id"],
            "text": item["input_text"],
            "sentiment": {
                "label": item["sentiment_label"],
                "confidence": item["sentiment_confidence"],
                "probabilities": self._json_loads(item["sentiment_probabilities"], {}),
                "model_name": item["sentiment_model_name"],
                "mode": item["sentiment_mode"],
                "prediction_source": item["sentiment_prediction_source"],
                "model_available": bool(item["sentiment_model_available"]),
                "is_fallback": bool(item["sentiment_is_fallback"]),
            },
            "aspect": {
                "label": item["aspect_label"],
                "confidence": item["aspect_confidence"],
                "scores": self._json_loads(item["aspect_scores"], {}),
                "model_name": item["aspect_model_name"],
                "mode": item["aspect_mode"],
                "prediction_source": item["aspect_prediction_source"],
                "model_available": bool(item["aspect_model_available"]),
                "is_fallback": bool(item["aspect_is_fallback"]),
            },
            "request_source": item["request_source"],
            "created_at": str(item["created_at"]),
        }

    def _json_loads(self, value: str | None, default: Any) -> Any:
        if not value:
            return default
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return default
