import math
import unittest

from app.core import DIMENSIONS, deterministic_embedding, text_authenticity


class CoreEmbeddingTests(unittest.TestCase):
    def test_fallback_is_deterministic(self):
        self.assertEqual(
            deterministic_embedding("A grounded post"),
            deterministic_embedding("A grounded post"),
        )

    def test_fallback_has_384_finite_dimensions(self):
        embedding = deterministic_embedding("A grounded post")
        self.assertEqual(DIMENSIONS, len(embedding))
        self.assertTrue(all(math.isfinite(value) for value in embedding))

    def test_fallback_output_is_normalized(self):
        embedding = deterministic_embedding("A grounded post")
        norm = math.sqrt(sum(value * value for value in embedding))
        self.assertAlmostEqual(1.0, norm)

    def test_authenticity_scores_are_normalized(self):
        result = text_authenticity("A simple honest note about today.")
        self.assertGreaterEqual(result.text_score, 0)
        self.assertLessEqual(result.text_score, 1)
        self.assertGreaterEqual(result.combined_score, 0)
        self.assertLessEqual(result.combined_score, 1)

    def test_image_authenticity_remains_null_without_image_analysis(self):
        result = text_authenticity("A simple honest note.", "https://example.test/photo.jpg")
        self.assertIsNone(result.image_score)


if __name__ == "__main__":
    unittest.main()
