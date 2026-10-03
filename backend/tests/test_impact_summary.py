import unittest
from tempfile import TemporaryDirectory

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.connection import Base
from models.request import RequestDB
from models.resource import ResourceDB
from services.impact_summary import get_impact_summary


class ImpactSummaryTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        self.engine = create_engine(f"sqlite:///{self.temp_dir.name}/summary.db")
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.session = self.Session()

    def tearDown(self):
        self.session.close()
        self.engine.dispose()
        self.temp_dir.cleanup()

    def test_summary_counts_resources_and_normalized_organizations_only(self):
        self.session.add_all([
            ResourceDB(name="Laptop A", category="Electronics", quantity=2, location="Chennai", donor_org="North Star"),
            ResourceDB(name="Laptop B", category="Electronics", quantity=0, location="Chennai", donor_org="north star"),
            ResourceDB(name="Books", category="Books", quantity=3, location="Chennai", donor_org=" "),
        ])
        self.session.flush()
        self.session.add(RequestDB(
            resource_id=1,
            recipient_id=10,
            recipient_name="Recipient",
            recipient_org="Community School",
            quantity=1,
            reason="Needed for the library.",
            urgency="normal",
            base_priority=50,
        ))
        self.session.commit()

        summary = get_impact_summary(self.session)

        self.assertEqual(summary["resources_listed"], 3)
        self.assertEqual(summary["organizations_represented"], 2)
        self.assertEqual(summary["category_quantities"], {
            "Electronics": 2,
            "Books": 3,
            "Furniture": 0,
            "Educational": 0,
            "Sports": 0,
            "Materials": 0,
        })
        self.assertIsNone(summary["completed_donations"])
        self.assertIsNone(summary["resource_utilization_percent"])

    def test_empty_database_has_zero_counts_and_unknown_derived_metrics(self):
        summary = get_impact_summary(self.session)

        self.assertEqual(summary["resources_listed"], 0)
        self.assertEqual(summary["organizations_represented"], 0)
        self.assertEqual(summary["category_quantities"], {
            "Electronics": 0,
            "Books": 0,
            "Furniture": 0,
            "Educational": 0,
            "Sports": 0,
            "Materials": 0,
        })
        self.assertIsNone(summary["completed_donations"])
        self.assertIsNone(summary["resource_utilization_percent"])


if __name__ == "__main__":
    unittest.main()