import unittest
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from tempfile import TemporaryDirectory

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.connection import Base
from models.request import RequestDB
from models.resource import ResourceDB
from services.request_workflow import decide_request, schedule_requests


class RequestWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        self.engine = create_engine(
            f"sqlite:///{self.temp_dir.name}/test.db",
            connect_args={"check_same_thread": False, "timeout": 30},
        )
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.session = self.Session()

    def tearDown(self):
        self.session.close()
        self.engine.dispose()
        self.temp_dir.cleanup()

    def create_resource(self, quantity):
        resource = ResourceDB(
            name="Laptops",
            category="Electronics",
            quantity=quantity,
            location="Bangalore",
        )
        self.session.add(resource)
        self.session.commit()
        return resource

    def create_request(self, resource, quantity, base_priority=50, created_at=None):
        request = RequestDB(
            resource_id=resource.id,
            recipient_id=1,
            recipient_name="School",
            recipient_org="Community School",
            quantity=quantity,
            reason="Needed for the computer lab.",
            urgency="normal",
            base_priority=base_priority,
            status="Pending",
            created_at=created_at or datetime.now(timezone.utc),
        )
        self.session.add(request)
        self.session.commit()
        return request

    def test_priority_aging_prevents_starvation(self):
        resource = self.create_resource(10)
        now = datetime.now(timezone.utc)
        new_urgent = self.create_request(resource, 1, base_priority=100, created_at=now)
        old_normal = self.create_request(
            resource,
            1,
            base_priority=50,
            created_at=now - timedelta(hours=51),
        )

        scheduled = schedule_requests([new_urgent, old_normal], now)

        self.assertEqual([request.id for request, _ in scheduled], [old_normal.id, new_urgent.id])

    def test_approval_cannot_overallocate_and_is_idempotent(self):
        resource = self.create_resource(3)
        first = self.create_request(resource, 2)
        second = self.create_request(resource, 2)

        approved = decide_request(self.session, first.id, "approve")
        waitlisted = decide_request(self.session, second.id, "approve")
        repeated = decide_request(self.session, first.id, "approve")

        self.session.refresh(resource)
        self.assertEqual(approved.status, "Approved")
        self.assertEqual(waitlisted.status, "Waitlisted")
        self.assertIsNone(repeated)
        self.assertEqual(resource.quantity, 1)

    def test_competing_approvals_serialize_inventory_allocation(self):
        resource = self.create_resource(2)
        requests = [self.create_request(resource, 2) for _ in range(2)]

        def approve(request_id):
            session = self.Session()
            try:
                request = decide_request(session, request_id, "approve")
                return request.status if request else None
            finally:
                session.close()

        with ThreadPoolExecutor(max_workers=2) as executor:
            statuses = list(executor.map(approve, [request.id for request in requests]))

        self.session.refresh(resource)
        self.assertCountEqual(statuses, ["Approved", "Waitlisted"])
        self.assertEqual(resource.quantity, 0)


if __name__ == "__main__":
    unittest.main()