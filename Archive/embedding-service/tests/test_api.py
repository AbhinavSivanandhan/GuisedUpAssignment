import unittest
from unittest.mock import patch


try:
    from fastapi.testclient import TestClient
    from app.main import app
    import app.main as main
except ModuleNotFoundError:
    TestClient = None
    app = None
    main = None


@unittest.skipIf(TestClient is None, "FastAPI test dependencies are not installed")
class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(200, response.status_code)
        self.assertEqual(384, response.json()["dimensions"])

    def test_fallback_response_shape(self):
        response = self.client.post("/analyze", json={"text": "hello", "mode": "fallback"})
        self.assertEqual(200, response.status_code)
        payload = response.json()
        self.assertEqual(384, len(payload["embedding"]))
        self.assertEqual("fallback", payload["mode"])
        self.assertIsNone(payload["authenticity"]["image_score"])

    def test_mocked_transformer_response_shape(self):
        with patch.object(main, "transformer_embedding", return_value=[0.01] * 384):
            response = self.client.post("/analyze", json={"text": "hello", "mode": "transformer"})

        self.assertEqual(200, response.status_code)
        payload = response.json()
        self.assertEqual(384, len(payload["embedding"]))
        self.assertEqual("transformer", payload["mode"])
        self.assertEqual("sentence-transformers/all-MiniLM-L6-v2", payload["model"])

    def test_empty_input_is_rejected(self):
        response = self.client.post("/analyze", json={"text": "", "mode": "fallback"})
        self.assertEqual(422, response.status_code)


if __name__ == "__main__":
    unittest.main()
