from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from datetime import date, timedelta
from decimal import Decimal

from .models import Company, InternshipPlacement
from .serializers import InternshipPlacementSerializer

User = get_user_model()

class PlacementModelTests(TestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            email="student@test.com",
            password="pass123",
            role="STUDENT"
        )

        self.wp = User.objects.create_user(
            email="wp@test.com",
            password="pass123",
            role="WP_SUP"
        )

        self.ac = User.objects.create_user(
            email="ac@test.com",
            password="pass123",
            role="AC_SUP"
        )

        self.company = Company.objects.create(
            name="Test Company"
        )

    # 1
    def test_company_str(self):
        self.assertEqual(str(self.company), "Test Company")

    # 2
    def test_create_placement(self):
        placement = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            workplace_supervisor=self.wp,
            academic_supervisor=self.ac,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="ACTIVE"
        )
        self.assertEqual(placement.student.email, "student@test.com")

    # 3
    def test_placement_str(self):
        placement = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10)
        )
        self.assertIn("Test Company", str(placement))

    # 4
    def test_end_date_validation(self):
        with self.assertRaises(Exception):
            InternshipPlacement.objects.create(
                student=self.student,
                company=self.company,
                start_date=date.today(),
                end_date=date.today() - timedelta(days=1)
            )

    # 5
    def test_overlapping_placement_blocked(self):
        InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10),
            status="ACTIVE"
        )

        with self.assertRaises(Exception):
            InternshipPlacement.objects.create(
                student=self.student,
                company=self.company,
                start_date=date.today() + timedelta(days=5),
                end_date=date.today() + timedelta(days=15),
                status="ACTIVE"
            )

    # 6
    def test_non_overlapping_allowed(self):
        p1 = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=5)
        )

        p2 = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today() + timedelta(days=6),
            end_date=date.today() + timedelta(days=10)
        )

        self.assertIsNotNone(p1.id)
        self.assertIsNotNone(p2.id)

    # 7
    def test_get_ac_evaluation_empty(self):
        placement = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10)
        )
        self.assertIsNone(placement.get_ac_evaluation())

    # 8
    def test_get_wp_evaluation_empty(self):
        placement = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10)
        )
        self.assertIsNone(placement.get_wp_evaluation())

    # 9
    def test_final_score_initial_none(self):
        placement = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10)
        )
        self.assertIsNone(placement.final_score)

    # 10
    def test_calculate_final_score_no_evals(self):
        placement = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10)
        )
        self.assertIsNone(placement.calculate_final_score())

    # 11
    def test_company_creation(self):
        c = Company.objects.create(name="New Company")
        self.assertEqual(c.name, "New Company")

    # 12
    def test_placement_status_default(self):
        placement = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10)
        )
        self.assertEqual(placement.status, "PENDING")

class PlacementSerializerTests(TestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            email="student@test.com",
            password="pass123",
            role="STUDENT"
        )

        self.wp = User.objects.create_user(
            email="wp@test.com",
            password="pass123",
            role="WP_SUP"
        )

        self.ac = User.objects.create_user(
            email="ac@test.com",
            password="pass123",
            role="AC_SUP"
        )

        self.company = Company.objects.create(name="Company A")

    # 13
    def test_valid_serializer(self):
        data = {
            "student": self.student.id,
            "company": self.company.id,
            "workplace_supervisor": self.wp.id,
            "academic_supervisor": self.ac.id,
            "start_date": date.today(),
            "end_date": date.today() + timedelta(days=10),
        }

        serializer = InternshipPlacementSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    # 14
    def test_invalid_date(self):
        data = {
            "student": self.student.id,
            "company": self.company.id,
            "start_date": date.today(),
            "end_date": date.today() - timedelta(days=1),
        }

        serializer = InternshipPlacementSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    # 15
    def test_invalid_student_role(self):
        bad_user = User.objects.create_user(
            email="bad@test.com",
            password="pass123",
            role="ADMIN"
        )

        data = {
            "student": bad_user.id,
            "company": self.company.id,
            "start_date": date.today(),
            "end_date": date.today() + timedelta(days=10),
        }

        serializer = InternshipPlacementSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    # 16
    def test_invalid_wp_role(self):
        bad_user = User.objects.create_user(
            email="badwp@test.com",
            password="pass123",
            role="STUDENT"
        )

        data = {
            "student": self.student.id,
            "company": self.company.id,
            "workplace_supervisor": bad_user.id,
            "start_date": date.today(),
            "end_date": date.today() + timedelta(days=10),
        }

        serializer = InternshipPlacementSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    # 17
    def test_invalid_ac_role(self):
        bad_user = User.objects.create_user(
            email="badac@test.com",
            password="pass123",
            role="WP_SUP"
        )

        data = {
            "student": self.student.id,
            "company": self.company.id,
            "academic_supervisor": bad_user.id,
            "start_date": date.today(),
            "end_date": date.today() + timedelta(days=10),
        }

        serializer = InternshipPlacementSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    # 18
    def test_serializer_overlap_validation(self):
        InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10)
        )

        data = {
            "student": self.student.id,
            "company": self.company.id,
            "start_date": date.today() + timedelta(days=5),
            "end_date": date.today() + timedelta(days=15),
        }

        serializer = InternshipPlacementSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    # 19
    def test_serializer_student_name_field(self):
        placement = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10)
        )

        serializer = InternshipPlacementSerializer(placement)
        self.assertIn("student_name", serializer.data)

    # 20
    def test_serializer_company_name_field(self):
        placement = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10)
        )

        serializer = InternshipPlacementSerializer(placement)
        self.assertEqual(serializer.data["company_name"], "Company A")

    # 21
    def test_serializer_fields_exist(self):
        placement = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10)
        )

        serializer = InternshipPlacementSerializer(placement)
        self.assertIn("start_date", serializer.data)

    # 22
    def test_serializer_id_present(self):
        placement = InternshipPlacement.objects.create(
            student=self.student,
            company=self.company,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=10)
        )

        serializer = InternshipPlacementSerializer(placement)
        self.assertIn("id", serializer.data)

