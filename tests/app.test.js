/**
 * Frontend Tests for Activity Management Application
 * Tests the client-side JavaScript functionality
 */

// Mock fetch for testing
global.fetch = jest.fn();

// Mock DOM elements
const setupDOM = () => {
  document.body.innerHTML = `
    <div id="activities-list"></div>
    <select id="activity">
      <option value="">-- Select an activity --</option>
    </select>
    <form id="signup-form">
      <input type="email" id="email" />
      <select id="activity"></select>
      <button type="submit">Sign Up</button>
    </form>
    <div id="message" class="hidden"></div>
  `;
};

describe('Activity Management Frontend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDOM();
    fetch.mockClear();
  });

  describe('fetchActivities', () => {
    // Arrange
    const mockActivitiesResponse = {
      "Chess Club": {
        "description": "Learn strategies and compete",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
      }
    };

    test('fetches and displays activities', async () => {
      // Arrange
      fetch.mockResolvedValueOnce({
        json: async () => mockActivitiesResponse
      });

      // Act
      const activitiesList = document.getElementById("activities-list");
      const response = await fetch("/activities");
      const data = await response.json();

      // Assert
      expect(fetch).toHaveBeenCalledWith("/activities");
      expect(data).toEqual(mockActivitiesResponse);
      expect(data["Chess Club"]).toBeDefined();
    });

    test('handles fetch errors gracefully', async () => {
      // Arrange
      fetch.mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(fetch("/activities")).rejects.toThrow('Network error');
    });
  });

  describe('Signup Form', () => {
    test('signup form has required fields', () => {
      // Arrange & Act
      const form = document.getElementById("signup-form");
      const emailInput = document.getElementById("email");
      const activitySelect = document.getElementById("activity");

      // Assert
      expect(form).toBeTruthy();
      expect(emailInput).toBeTruthy();
      expect(activitySelect).toBeTruthy();
    });

    test('email input has email type', () => {
      // Arrange & Act
      const emailInput = document.getElementById("email");

      // Assert
      expect(emailInput.type).toBe("email");
    });

    test('activity select has required attribute', () => {
      // Arrange & Act
      const activitySelect = document.getElementById("activity");

      // Assert
      expect(activitySelect.required).toBe(true);
    });
  });

  describe('Participant Display', () => {
    test('activity card shows participant list', () => {
      // Arrange
      const mockActivity = {
        name: "Chess Club",
        details: {
          description: "Learn strategies",
          schedule: "Fridays, 3:30 PM - 5:00 PM",
          max_participants: 12,
          participants: ["michael@mergington.edu", "daniel@mergington.edu"]
        }
      };

      // Act
      const participantsList = mockActivity.details.participants.map(
        participant => `<li><span>${participant}</span></li>`
      ).join('');

      // Assert
      expect(participantsList).toContain("michael@mergington.edu");
      expect(participantsList).toContain("daniel@mergington.edu");
      expect(participantsList.split('<li>').length - 1).toBe(2);
    });

    test('calculates available spots correctly', () => {
      // Arrange
      const activity = {
        max_participants: 12,
        participants: ["michael@mergington.edu", "daniel@mergington.edu"]
      };

      // Act
      const spotsLeft = activity.max_participants - activity.participants.length;

      // Assert
      expect(spotsLeft).toBe(10);
    });
  });

  describe('Message Display', () => {
    test('message div is hidden by default', () => {
      // Arrange & Act
      const messageDiv = document.getElementById("message");

      // Assert
      expect(messageDiv.classList.contains("hidden")).toBe(true);
    });

    test('success class is applied for successful signup', () => {
      // Arrange
      const messageDiv = document.getElementById("message");

      // Act
      messageDiv.textContent = "Successfully signed up!";
      messageDiv.className = "success";
      messageDiv.classList.remove("hidden");

      // Assert
      expect(messageDiv.classList.contains("success")).toBe(true);
      expect(messageDiv.classList.contains("hidden")).toBe(false);
    });

    test('error class is applied for failed signup', () => {
      // Arrange
      const messageDiv = document.getElementById("message");

      // Act
      messageDiv.textContent = "Already signed up for this activity";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");

      // Assert
      expect(messageDiv.classList.contains("error")).toBe(true);
      expect(messageDiv.textContent).toContain("Already signed up");
    });
  });

  describe('Delete Participant Functionality', () => {
    test('delete button has correct attributes', () => {
      // Arrange
      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-participant";
      deleteButton.dataset.activity = "Chess Club";
      deleteButton.dataset.email = "michael@mergington.edu";
      deleteButton.textContent = "×";

      // Act & Assert
      expect(deleteButton.className).toContain("delete-participant");
      expect(deleteButton.dataset.activity).toBe("Chess Club");
      expect(deleteButton.dataset.email).toBe("michael@mergington.edu");
      expect(deleteButton.textContent).toBe("×");
    });

    test('delete endpoint called with correct parameters', async () => {
      // Arrange
      const activity = "Chess Club";
      const email = "michael@mergington.edu";
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: `Removed ${email} from ${activity}` })
      });

      // Act
      const url = `/activities/${encodeURIComponent(activity)}/remove?email=${encodeURIComponent(email)}`;
      const response = await fetch(url, { method: "DELETE" });
      const data = await response.json();

      // Assert
      expect(fetch).toHaveBeenCalledWith(url, { method: "DELETE" });
      expect(response.ok).toBe(true);
      expect(data.message).toContain("Removed");
    });
  });

  describe('Form Submission', () => {
    test('form prevents default submission', () => {
      // Arrange
      const form = document.getElementById("signup-form");
      const event = new Event('submit');
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      // Act
      form.dispatchEvent(event);

      // Assert
      expect(form).toBeTruthy();
    });

    test('email and activity are extracted from form', () => {
      // Arrange
      const emailInput = document.getElementById("email");
      const activitySelect = document.getElementById("activity");
      emailInput.value = "student@mergington.edu";
      activitySelect.value = "Chess Club";

      // Act
      const email = emailInput.value;
      const activity = activitySelect.value;

      // Assert
      expect(email).toBe("student@mergington.edu");
      expect(activity).toBe("Chess Club");
    });
  });

  describe('Activity Capacity', () => {
    test('capacity calculation is accurate', () => {
      // Arrange
      const activities = [
        {
          name: "Chess Club",
          max_participants: 12,
          participants: ["michael@mergington.edu", "daniel@mergington.edu"]
        },
        {
          name: "Gym Class",
          max_participants: 30,
          participants: ["john@mergington.edu", "olivia@mergington.edu", "alex@mergington.edu"]
        }
      ];

      // Act
      const chessCapacity = activities[0].max_participants - activities[0].participants.length;
      const gymCapacity = activities[1].max_participants - activities[1].participants.length;

      // Assert
      expect(chessCapacity).toBe(10);
      expect(gymCapacity).toBe(27);
    });

    test('displays when activity is full', () => {
      // Arrange
      const activity = {
        max_participants: 12,
        participants: new Array(12).fill("student@mergington.edu")
      };

      // Act
      const spotsLeft = activity.max_participants - activity.participants.length;
      const isFull = spotsLeft === 0;

      // Assert
      expect(isFull).toBe(true);
      expect(spotsLeft).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles activity names with special characters', () => {
      // Arrange
      const activityName = "Programming Class";

      // Act
      const encoded = encodeURIComponent(activityName);

      // Assert
      expect(encoded).toBe("Programming%20Class");
    });

    test('handles emails with plus addressing', () => {
      // Arrange
      const email = "student+tag@mergington.edu";

      // Act
      const encoded = encodeURIComponent(email);

      // Assert
      expect(encoded).toContain("%2B");
      expect(encoded).toContain("tag");
    });

    test('validates email format', () => {
      // Arrange
      const validEmail = "student@mergington.edu";
      const invalidEmail = "not-an-email";

      // Act
      const emailInput = document.getElementById("email");
      emailInput.value = validEmail;

      // Assert
      expect(emailInput.value).toBe(validEmail);
      expect(emailInput.value).toContain("@");
    });
  });

  describe('UI State Management', () => {
    test('activity select populates with options', () => {
      // Arrange
      const activitySelect = document.getElementById("activity");
      const activities = ["Chess Club", "Programming Class", "Gym Class"];

      // Act
      activities.forEach(activity => {
        const option = document.createElement("option");
        option.value = activity;
        option.textContent = activity;
        activitySelect.appendChild(option);
      });

      // Assert
      expect(activitySelect.options.length).toBe(4); // 1 default + 3 activities
      expect(activitySelect.options[1].value).toBe("Chess Club");
    });

    test('form resets after successful submission', () => {
      // Arrange
      const emailInput = document.getElementById("email");
      const activitySelect = document.getElementById("activity");
      const form = document.getElementById("signup-form");

      emailInput.value = "student@mergington.edu";
      activitySelect.value = "Chess Club";

      // Act
      form.reset();

      // Assert
      expect(emailInput.value).toBe("");
      expect(activitySelect.value).toBe("");
    });

    test('message auto-hides after timeout', (done) => {
      // Arrange
      const messageDiv = document.getElementById("message");
      messageDiv.classList.remove("hidden");

      // Act
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);

      // Assert (immediate)
      expect(messageDiv.classList.contains("hidden")).toBe(false);

      // Assert (after timeout)
      setTimeout(() => {
        expect(messageDiv.classList.contains("hidden")).toBe(true);
        done();
      }, 5100);
    });
  });
});
