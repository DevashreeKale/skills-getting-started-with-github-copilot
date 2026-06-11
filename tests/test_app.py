import pytest


class TestGetActivities:
    """Tests for GET /activities endpoint"""

    def test_get_activities_returns_all_activities(self, client):
        """Test that GET /activities returns all activities"""
        response = client.get("/activities")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, dict)
        assert "Chess Club" in data
        assert "Programming Class" in data
        assert "Gym Class" in data

    def test_activity_has_required_fields(self, client):
        """Test that each activity has all required fields"""
        response = client.get("/activities")
        data = response.json()
        
        activity = data["Chess Club"]
        assert "description" in activity
        assert "schedule" in activity
        assert "max_participants" in activity
        assert "participants" in activity

    def test_activity_participants_is_list(self, client):
        """Test that participants field is a list"""
        response = client.get("/activities")
        data = response.json()
        
        assert isinstance(data["Chess Club"]["participants"], list)


class TestSignupForActivity:
    """Tests for POST /activities/{activity_name}/signup endpoint"""

    def test_signup_successful(self, client):
        """Test successful signup for an activity"""
        response = client.post(
            "/activities/Chess Club/signup?email=newstudent@mergington.edu"
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "newstudent@mergington.edu" in data["message"]

    def test_signup_adds_participant(self, client):
        """Test that signup actually adds the participant"""
        email = "newstudent@mergington.edu"
        
        # Sign up
        client.post(f"/activities/Chess Club/signup?email={email}")
        
        # Verify participant was added
        response = client.get("/activities")
        data = response.json()
        assert email in data["Chess Club"]["participants"]

    def test_signup_duplicate_email_fails(self, client):
        """Test that signing up with same email twice fails"""
        email = "michael@mergington.edu"  # Already signed up for Chess Club
        
        response = client.post(
            f"/activities/Chess Club/signup?email={email}"
        )
        assert response.status_code == 400
        assert "Already signed up" in response.json()["detail"]

    def test_signup_nonexistent_activity_fails(self, client):
        """Test that signing up for non-existent activity fails"""
        response = client.post(
            "/activities/Nonexistent Club/signup?email=student@mergington.edu"
        )
        assert response.status_code == 404
        assert "Activity not found" in response.json()["detail"]

    def test_signup_full_activity_fails(self, client):
        """Test that signing up for full activity fails"""
        # Chess Club has 2/12 participants, let's fill it up
        for i in range(10):
            client.post(
                f"/activities/Chess Club/signup?email=student{i}@mergington.edu"
            )
        
        # Try to add one more past capacity
        response = client.post(
            "/activities/Chess Club/signup?email=overfull@mergington.edu"
        )
        assert response.status_code == 400
        assert "Activity is full" in response.json()["detail"]

    def test_signup_different_activity_same_email_succeeds(self, client):
        """Test that same email can sign up for different activities"""
        email = "testuser@mergington.edu"
        
        # Sign up for Chess Club
        response1 = client.post(
            f"/activities/Chess Club/signup?email={email}"
        )
        assert response1.status_code == 200
        
        # Sign up for Programming Class
        response2 = client.post(
            f"/activities/Programming Class/signup?email={email}"
        )
        assert response2.status_code == 200


class TestRemoveParticipant:
    """Tests for DELETE /activities/{activity_name}/remove endpoint"""

    def test_remove_participant_successful(self, client):
        """Test successful removal of a participant"""
        email = "michael@mergington.edu"
        activity = "Chess Club"
        
        response = client.delete(
            f"/activities/{activity}/remove?email={email}"
        )
        assert response.status_code == 200
        assert email in response.json()["message"]

    def test_remove_participant_removes_from_list(self, client):
        """Test that participant is actually removed"""
        email = "michael@mergington.edu"
        activity = "Chess Club"
        
        # Remove participant
        client.delete(f"/activities/{activity}/remove?email={email}")
        
        # Verify participant was removed
        response = client.get("/activities")
        data = response.json()
        assert email not in data[activity]["participants"]

    def test_remove_nonexistent_participant_fails(self, client):
        """Test that removing non-existent participant fails"""
        response = client.delete(
            "/activities/Chess Club/remove?email=notreal@mergington.edu"
        )
        assert response.status_code == 400
        assert "not signed up" in response.json()["detail"]

    def test_remove_from_nonexistent_activity_fails(self, client):
        """Test that removing from non-existent activity fails"""
        response = client.delete(
            "/activities/Fake Club/remove?email=student@mergington.edu"
        )
        assert response.status_code == 404
        assert "Activity not found" in response.json()["detail"]

    def test_remove_frees_up_spot(self, client):
        """Test that removing a participant frees up a spot"""
        # Fill up Chess Club to capacity
        for i in range(10):
            client.post(
                f"/activities/Chess Club/signup?email=filler{i}@mergington.edu"
            )
        
        # Verify it's full
        response = client.post(
            "/activities/Chess Club/signup?email=shouldfail@mergington.edu"
        )
        assert response.status_code == 400
        
        # Remove one participant
        client.delete("/activities/Chess Club/remove?email=michael@mergington.edu")
        
        # Now we should be able to sign up
        response = client.post(
            "/activities/Chess Club/signup?email=shouldfail@mergington.edu"
        )
        assert response.status_code == 200


class TestActivityCapacity:
    """Tests for activity capacity management"""

    def test_available_spots_calculated_correctly(self, client):
        """Test that available spots are calculated correctly"""
        response = client.get("/activities")
        data = response.json()
        
        chess_club = data["Chess Club"]
        spots_available = chess_club["max_participants"] - len(chess_club["participants"])
        assert spots_available == 10  # 12 max - 2 current


class TestEdgeCases:
    """Tests for edge cases and boundary conditions"""

    def test_email_with_special_characters_encoded(self, client):
        """Test that emails with special characters are handled"""
        email = "test+tag@mergington.edu"
        
        response = client.post(
            f"/activities/Chess Club/signup?email={email}"
        )
        assert response.status_code == 200

    def test_activity_name_with_spaces(self, client):
        """Test that activity names with spaces are handled"""
        response = client.get("/activities")
        assert response.status_code == 200
        
        data = response.json()
        assert "Basketball Team" in data
        assert "Programming Class" in data
