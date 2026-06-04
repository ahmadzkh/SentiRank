from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_random_reviews_should_return_safe_research_samples() -> None:
    response = client.get("/reviews/random?limit=3&with_aspect=true")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["limit"] == 3
    assert payload["data"]["count"] == 3
    assert len(payload["data"]["items"]) == 3

    sample = payload["data"]["items"][0]
    assert sample["id"].startswith("research-review-")
    assert "reviewText" in sample
    assert "external_id" not in sample


def test_get_random_reviews_should_filter_sentiment() -> None:
    response = client.get("/reviews/random?limit=5&sentiment=negative")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["count"] <= 5
    assert all(
        item["sentiment"] == "negative" for item in payload["data"]["items"]
    )
