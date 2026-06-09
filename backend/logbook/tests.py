from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta, date
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch

from .models import WeeklyLog, LogReview

def monday():
    today = date.today()
    return today - timedelta(days=today.weekday())

def make_user(role="STUDENT", email=None):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    email = email or f"{role}_{timezone.now().timestamp()}@t.com"
    return User.objects.create_user(email=email, password="pass", role=role)

def make_placement(student, ac_sup=None, wp_sup=None, status="ACTIVE"):
    from placements.models import InternshipPlacement, Company
    company, _ = Company.objects.get_or_create(name="Co")
    today = date.today()
    return InternshipPlacement.objects.create(
        student=student, company=company, status=status,
        start_date=today - timedelta(weeks=4),
        end_date=today + timedelta(weeks=8),
        academic_supervisor=ac_sup, workplace_supervisor=wp_sup,
    )

def make_log(placement, week=None, log_status="DRAFT"):
    return WeeklyLog.objects.create(
        placement=placement,
        week_start_date=week or monday(),
        activities="Did stuff",
        status=log_status,
    )


# Model tests

class WeeklyLogModelTest(TestCase):
    def setUp(self):
        self.placement = make_placement(make_user())

    def test_week_end_and_deadline_auto_set(self):
        log = make_log(self.placement)
        self.assertEqual(log.week_end_date, monday() + timedelta(days=6))
        self.assertEqual(log.deadline.date(), monday() + timedelta(days=6))
        self.assertEqual((log.deadline.hour, log.deadline.minute), (23, 59))

    def test_duplicate_week_raises(self):
        from django.core.exceptions import ValidationError
        make_log(self.placement)
        with self.assertRaises(Exception):
            make_log(self.placement)

    def test_non_monday_start_raises(self):
        with self.assertRaises(Exception):
            make_log(self.placement, week=monday() + timedelta(days=1))

    def test_week_outside_placement_raises(self):
        with self.assertRaises(Exception):
            make_log(self.placement, week=date(2000, 1, 3))


#  WeeklyLog API Tests 

class WeeklyLogAPITest(APITestCase):
    def setUp(self):
        self.student = make_user("STUDENT", "s@t.com")
        self.sup     = make_user("AC_SUP",  "ac@t.com")
        self.wp_sup  = make_user("WP_SUP",  "wp@t.com")
        self.placement = make_placement(self.student, ac_sup=self.sup, wp_sup=self.wp_sup)
        self.log = make_log(self.placement)

    def auth(self, user):
        self.client.force_authenticate(user=user)

    
    def test_student_can_create_log(self):
        self.auth(self.student)
        r = self.client.post(reverse("logs-list"), {
            "week_start_date": monday().isoformat(), "activities": "Work"
        })
        # log already exists for this week, so delete it first
        self.log.delete()
        r = self.client.post(reverse("logs-list"), {
            "week_start_date": monday().isoformat(), "activities": "Work"
        })
        self.assertEqual(r.status_code, 201)

    def test_create_past_week_fails(self):
        self.auth(self.student)
        r = self.client.post(reverse("logs-list"), {
            "week_start_date": (monday() - timedelta(weeks=1)).isoformat(),
            "activities": "Old"
        })
        self.assertEqual(r.status_code, 400)

    def test_create_duplicate_week_fails(self):
        self.auth(self.student)
        r = self.client.post(reverse("logs-list"), {
            "week_start_date": monday().isoformat(), "activities": "Dup"
        })
        self.assertEqual(r.status_code, 400)

    def test_unauthenticated_create_fails(self):
        r = self.client.post(reverse("logs-list"), {"week_start_date": monday().isoformat()})
        self.assertEqual(r.status_code, 401)

    # role filtering 
    def test_student_only_sees_own_logs(self):
        other = make_user("STUDENT", "other@t.com")
        other_placement = make_placement(other)
        make_log(other_placement, week=monday() - timedelta(weeks=2))

        self.auth(self.student)
        ids = [x["id"] for x in self.client.get(reverse("logs-list")).data]
        self.assertIn(self.log.id, ids)
        self.assertEqual(len(ids), 1)

    
    def test_submit_draft_succeeds(self):
        self.auth(self.student)
        r = self.client.post(reverse("logs-submit", kwargs={"pk": self.log.pk}))
        self.assertEqual(r.status_code, 200)
        self.log.refresh_from_db()
        self.assertEqual(self.log.status, "SUBMITTED")

    def test_submit_already_submitted_fails(self):
        self.log.status = "SUBMITTED"; self.log.save()
        self.auth(self.student)
        r = self.client.post(reverse("logs-submit", kwargs={"pk": self.log.pk}))
        self.assertEqual(r.status_code, 400)

  

    
    def test_supervisor_can_approve(self):
        self.log.status = "SUBMITTED"; self.log.save()
        self.auth(self.sup)
        r = self.client.post(reverse("logs-review", kwargs={"pk": self.log.pk}),
                             {"action": "approve", "comment": "Good"})
        self.assertEqual(r.status_code, 200)
        self.log.refresh_from_db()
        self.assertEqual(self.log.status, "APPROVED")
        self.assertTrue(LogReview.objects.filter(log=self.log).exists())

    def test_supervisor_can_reject(self):
        self.log.status = "SUBMITTED"; self.log.save()
        self.auth(self.sup)
        r = self.client.post(reverse("logs-review", kwargs={"pk": self.log.pk}),
                             {"action": "reject"})
        self.log.refresh_from_db()
        self.assertEqual(self.log.status, "REJECTED")

    def test_student_cannot_review(self):
        self.log.status = "SUBMITTED"; self.log.save()
        self.auth(self.student)
        r = self.client.post(reverse("logs-review", kwargs={"pk": self.log.pk}),
                             {"action": "approve"})
        self.assertEqual(r.status_code, 403)

    def test_review_draft_fails(self):
        self.auth(self.sup)
        r = self.client.post(reverse("logs-review", kwargs={"pk": self.log.pk}),
                             {"action": "approve"})
        self.assertEqual(r.status_code, 400)

    def test_invalid_review_action_fails(self):
        self.log.status = "SUBMITTED"; self.log.save()
        self.auth(self.sup)
        r = self.client.post(reverse("logs-review", kwargs={"pk": self.log.pk}),
                             {"action": "maybe"})
        self.assertEqual(r.status_code, 400)

    
    def test_can_delete_draft(self):
        self.auth(self.student)
        r = self.client.delete(reverse("logs-detail", kwargs={"pk": self.log.pk}))
        self.assertEqual(r.status_code, 204)



#  Dashboard Tests 

class DashboardTest(APITestCase):
    def setUp(self):
        self.student = make_user("STUDENT", "ds@t.com")
        self.ac_sup  = make_user("AC_SUP",  "dac@t.com")
        self.wp_sup  = make_user("WP_SUP",  "dwp@t.com")
        self.admin   = make_user("ADMIN",   "da@t.com")
        make_placement(self.student, ac_sup=self.ac_sup, wp_sup=self.wp_sup)

    def _check(self, user, url_name, expected_keys, wrong_user=None):
        self.client.force_authenticate(user=user)
        r = self.client.get(reverse(url_name))
        self.assertEqual(r.status_code, 200)
        for key in expected_keys:
            self.assertIn(key, r.data)
        # wrong role → 403
        self.client.force_authenticate(user=wrong_user or self.student)
        self.assertEqual(self.client.get(reverse(url_name)).status_code, 403)

    def test_academic_dashboard(self):
        self._check(self.ac_sup, "academic-dashboard", ["stats", "placements"])

    def test_admin_dashboard(self):
        self._check(self.admin, "admin-dashboard", ["users", "placements", "logs"])


    def test_dashboards_require_auth(self):
        self.client.logout()
        for url in ["academic-dashboard", "admin-dashboard"]:
            self.assertEqual(self.client.get(reverse(url)).status_code, 401)

