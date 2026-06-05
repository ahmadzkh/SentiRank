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

    def latest_negative_reviews(self, limit, sort="reviewed_at_desc"):
        return RandomReviewsData(
            reviews=[
                ReviewSample(
                    external_id="fixture-negative-1",
                    user_id="fixture-negative-1",
                    user_name="Fixture Reviewer",
                    rating=1,
                    content="fixture negative review",
                    word_count=3,
                    initial_sentiment="Negative",
                    final_sentiment="Negative",
                    aspect_label="Ads Experience",
                    reviewed_at="2026-05-02T00:00:00",
                    source="fixture",
                )
            ],
            count=1,
            filters=RandomReviewFilters(
                limit=limit,
                applied_limit=min(limit, 50),
                sentiment="Negative",
                rating=None,
                seed=None,
                sort=sort,
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


def test_latest_negative_reviews_route_should_return_aspect_label(monkeypatch) -> None:
    monkeypatch.setattr("app.routers.review._service", lambda: FakeReviewService())

    response = client.get("/reviews/latest-negative?limit=5&sort=word_count_desc")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["count"] == 1
    assert payload["data"]["reviews"][0]["final_sentiment"] == "Negative"
    assert payload["data"]["reviews"][0]["aspect_label"] == "Ads Experience"
    assert payload["data"]["reviews"][0]["user_name"] == "Fixture Reviewer"
    assert payload["data"]["reviews"][0]["word_count"] == 3
    assert payload["data"]["filters"]["sort"] == "word_count_desc"
