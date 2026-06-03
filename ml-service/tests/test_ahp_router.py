from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


CRITERIA = [
    {"id": "C1", "name": "Features"},
    {"id": "C2", "name": "Reliability"},
    {"id": "C3", "name": "Ads"},
]

AHP_COMPARISONS = [
    {"criterion_a": "C1", "criterion_b": "C2", "value_a_over_b": 3},
    {"criterion_a": "C1", "criterion_b": "C3", "value_a_over_b": 5},
    {"criterion_a": "C2", "criterion_b": "C3", "value_a_over_b": 2},
]

FUZZY_COMPARISONS = [
    {
        "criterion_a": "C1",
        "criterion_b": "C2",
        "fuzzy_value_a_over_b": {"l": 2, "m": 3, "u": 4},
    },
    {
        "criterion_a": "C1",
        "criterion_b": "C3",
        "fuzzy_value_a_over_b": {"l": 4, "m": 5, "u": 6},
    },
    {
        "criterion_a": "C2",
        "criterion_b": "C3",
        "fuzzy_value_a_over_b": {"l": 2, "m": 3, "u": 4},
    },
]


def test_get_ahp_criteria_should_return_five_criteria() -> None:
    response = client.get("/ahp/criteria")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]) == 5
    assert payload["data"][0]["id"] == "C1"


def test_post_ahp_calculate_should_return_weights() -> None:
    response = client.post(
        "/ahp/calculate",
        json={"criteria": CRITERIA, "comparisons": AHP_COMPARISONS},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["method"] == "AHP"
    assert len(payload["data"]["weights"]) == 3


def test_post_fuzzy_ahp_calculate_should_return_weights() -> None:
    response = client.post(
        "/ahp/fuzzy-calculate",
        json={"criteria": CRITERIA, "comparisons": FUZZY_COMPARISONS},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["method"] == "Fuzzy AHP"
    assert len(payload["data"]["weights"]) == 3


def test_post_ahp_compare_should_return_deltas() -> None:
    ahp_payload = client.post(
        "/ahp/calculate",
        json={"criteria": CRITERIA, "comparisons": AHP_COMPARISONS},
    ).json()["data"]
    fuzzy_payload = client.post(
        "/ahp/fuzzy-calculate",
        json={"criteria": CRITERIA, "comparisons": FUZZY_COMPARISONS},
    ).json()["data"]

    response = client.post(
        "/ahp/compare",
        json={
            "ahp_weights": ahp_payload["weights"],
            "fuzzy_ahp_weights": fuzzy_payload["weights"],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["summary"]["total_criteria"] == 3
    assert len(payload["data"]["items"]) == 3


def test_invalid_ahp_payload_should_return_422() -> None:
    response = client.post(
        "/ahp/calculate",
        json={"criteria": CRITERIA, "comparisons": AHP_COMPARISONS[:2]},
    )

    assert response.status_code == 422
