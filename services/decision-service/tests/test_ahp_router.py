import pytest
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


def test_get_health_should_return_healthy_status() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "Decision service is healthy."
    assert payload["data"]["service"] == "decision-service"
    assert payload["data"]["version"] == "0.1.0"


def test_get_root_should_return_available_endpoints() -> None:
    response = client.get("/")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert "POST /ahp/calculate" in payload["data"]["available_endpoints"]


def test_get_ahp_criteria_should_return_five_final_criteria() -> None:
    response = client.get("/ahp/criteria")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]) == 5
    assert payload["data"][0]["id"] == "C1"
    assert payload["data"][0]["name"] == "Features, Content & Audio Experience"


def test_post_ahp_calculate_should_return_weights_and_cr() -> None:
    response = client.post(
        "/ahp/calculate",
        json={"criteria": CRITERIA, "comparisons": AHP_COMPARISONS},
    )

    assert response.status_code == 200
    payload = response.json()
    weights = payload["data"]["weights"]

    assert payload["success"] is True
    assert payload["data"]["method"] == "AHP"
    assert len(weights) == 3
    assert sum(weight["weight"] for weight in weights) == pytest.approx(1.0)
    assert "consistency_ratio" in payload["data"]


def test_post_fuzzy_ahp_calculate_should_return_weights_and_modal_cr() -> None:
    response = client.post(
        "/ahp/fuzzy-calculate",
        json={"criteria": CRITERIA, "comparisons": FUZZY_COMPARISONS},
    )

    assert response.status_code == 200
    payload = response.json()
    weights = payload["data"]["weights"]

    assert payload["success"] is True
    assert payload["data"]["method"] == "Fuzzy AHP"
    assert len(weights) == 3
    assert sum(weight["normalized_weight"] for weight in weights) == pytest.approx(1.0)
    assert "consistency_ratio_modal" in payload["data"]


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


def test_invalid_ahp_missing_comparison_should_return_error_envelope() -> None:
    response = client.post(
        "/ahp/calculate",
        json={"criteria": CRITERIA, "comparisons": AHP_COMPARISONS[:2]},
    )

    assert response.status_code == 422
    payload = response.json()
    assert payload["success"] is False
    assert payload["error"]["code"] == "VALIDATION_ERROR"


def test_invalid_fuzzy_tfn_should_return_422() -> None:
    invalid_comparisons = [
        {
            "criterion_a": "C1",
            "criterion_b": "C2",
            "fuzzy_value_a_over_b": {"l": 4, "m": 3, "u": 2},
        },
        *FUZZY_COMPARISONS[1:],
    ]

    response = client.post(
        "/ahp/fuzzy-calculate",
        json={"criteria": CRITERIA, "comparisons": invalid_comparisons},
    )

    assert response.status_code == 422
