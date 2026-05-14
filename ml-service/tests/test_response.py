from app.schemas.common import PlaceholderData
from app.utils.response import success_response


def test_success_response_should_wrap_data_when_data_is_provided() -> None:
    data = PlaceholderData(module="health", status="ready")

    response = success_response(
        message="Boundary is ready.",
        data=data,
    )

    assert response.success is True
    assert response.message == "Boundary is ready."
    assert response.data == data
