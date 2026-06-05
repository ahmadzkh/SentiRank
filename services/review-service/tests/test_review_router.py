from fastapi.testclient import TestClient

from app.main import app
from app.schemas.review import RandomReviewFilters, RandomReviewsData, ReviewSample


client = TestClient(app)


class FakeReviewService:
    def dataset_summary(self):
        return {"total_review_count": 10, "warnings": []}

    def scraping_summary(self):
        return {"total_achieved_rows": 10, "warnings": []}

    def preprocessing_summary(self):
        return {"total_rows": 10, "warnings": []}

    def random_reviews(self, limit, sentiment=None, rating=None, seed=None):
        return RandomReviewsData(
            reviews=[
                ReviewSample(
                    external_id="fixture-1",
                    rating=rating or 5,
                    content="fixture review",
                    initial_sentiment=sentiment or "Positive",
                    final_sentiment=sentiment or "Positive",
                    reviewed_at="2026-05-01T00:00:00",
                    source="fixture",
                )
            ],
            count=1,
            filters=RandomReviewFilters(
                limit=limit,
                applied_limit=min(limit, 50),
                sentiment=sentiment,
                rating=rating,
                seed=seed,
            ),
            warnings=[],
        )


def test_get_health_should_return_review_service_status() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "Review service is healthy."
    assert payload["data"]["service"] == "review-service"


def test_summary_routes_should_return_standard_envelope(monkeypatch) -> None:
    monkeypatch.setattr("app.routers.review._service", lambda: FakeReviewService())

    for path in ["/dataset/summary", "/scraping/summary", "/preprocessing/summary"]:
        response = client.get(path)
        assert response.status_code == 200
        assert response.json()["success"] is True


def test_random_reviews_route_should_pass_query_params(monkeypatch) -> None:
    monkeypatch.setattr("app.routers.review._service", lambda: FakeReviewService())

    response = client.get("/reviews/random?limit=5&sentiment=Positive&rating=5&seed=42")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["count"] == 1
    assert payload["data"]["filters"]["sentiment"] == "Positive"
    assert payload["data"]["filters"]["rating"] == 5
    assert payload["data"]["filters"]["seed"] == 42
