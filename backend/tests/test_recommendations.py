import unittest
from tempfile import TemporaryDirectory

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from algorithms.recommendation_scoring import score_resource
from database.connection import Base
from models.request import RequestDB
from models.resource import ResourceDB
from services.recommendation_service import generate_recommendations


class RecommendationTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        self.engine = create_engine(f"sqlite:///{self.temp_dir.name}/recommendations.db")
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.session = self.Session()

    def tearDown(self):
        self.session.close()
        self.engine.dispose()
        self.temp_dir.cleanup()

    def create_resource(self, name="Test Laptop", category="Electronics", quantity=2):
        resource = ResourceDB(
            name=name,
            category=category,
            quantity=quantity,
            location="Chennai",
            donor_id=2,
            donor_name="Donor",
            donor_org="Donor Org",
        )
        self.session.add(resource)
        self.session.commit()
        return resource

    def create_request(self, resource, recipient_id=10, quantity=1, urgency="normal", status="Pending"):
        request = RequestDB(
            resource_id=resource.id,
            recipient_id=recipient_id,
            recipient_name="Recipient",
            recipient_org="Recipient Org",
            quantity=quantity,
            reason="Needed for a verified test case.",
            urgency=urgency,
            base_priority=50,
            status=status,
        )
        self.session.add(request)
        self.session.commit()
        return request

    def test_score_is_explainable_and_uses_request_inputs(self):
        result = score_resource(
            resource_category="Electronics",
            requested_category="Electronics",
            available_quantity=2,
            requested_quantity=1,
            urgency="normal",
        )

        self.assertEqual(result["score"], 90)
        self.assertEqual(result["score_components"], {
            "category_fit": 1.0,
            "quantity_fit": 1.0,
            "urgency_fit": 0.5,
        })

    def test_generates_real_recommendation_and_nulls_unavailable_fields(self):
        requested_resource = self.create_resource("Requested Laptop", quantity=1)
        candidate = self.create_resource("Available Laptop", quantity=2)
        source_request = self.create_request(requested_resource)

        result = generate_recommendations(self.session, recipient_id=10)

        self.assertEqual(len(result["recommendations"]), 1)
        recommendation = result["recommendations"][0]
        self.assertEqual(recommendation["resource_id"], candidate.id)
        self.assertEqual(recommendation["source_request_id"], source_request.id)
        self.assertEqual(recommendation["recipient_name"], "Recipient")
        self.assertEqual(recommendation["score"], 90)
        self.assertIsNone(recommendation["distance_km"])
        self.assertIsNone(recommendation["previous_donations"])

    def test_empty_request_history_returns_no_fabricated_recommendations(self):
        self.create_resource()

        result = generate_recommendations(self.session, recipient_id=99)

        self.assertEqual(result["recommendations"], [])

    def test_excludes_unavailable_and_already_requested_resources(self):
        requested = self.create_resource("Requested", quantity=1)
        self.create_request(requested)
        self.create_resource("Out of stock", quantity=0)
        eligible = self.create_resource("Eligible", quantity=3)

        result = generate_recommendations(self.session, recipient_id=10)

        self.assertEqual([item["resource_id"] for item in result["recommendations"]], [eligible.id])

    def test_demand_level_uses_persisted_non_rejected_request_count(self):
        requested = self.create_resource("Requested", quantity=1)
        self.create_request(requested, recipient_id=10)
        for recipient_id in (11, 12):
            self.create_request(requested, recipient_id=recipient_id)
        self.create_request(requested, recipient_id=13, status="Rejected")
        candidate = self.create_resource("Eligible", quantity=3)

        result = generate_recommendations(self.session, recipient_id=10)
        recommendation = next(item for item in result["recommendations"] if item["resource_id"] == candidate.id)

        self.assertEqual(recommendation["demand_request_count"], 3)
        self.assertEqual(recommendation["demand_level"], "Medium")


if __name__ == "__main__":
    unittest.main()