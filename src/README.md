# Mergington High School Activities API

A FastAPI application that allows students to view, sign up for, and manage extracurricular activity registrations.

## Features

✨ **Core Functionality**
- View all available extracurricular activities with details
- Sign up for activities with validation
- Remove yourself from activities
- Real-time participant list display

🛡️ **Data Validation**
- Prevent duplicate signups
- Enforce activity capacity limits
- Comprehensive error handling

📱 **User Experience**
- Responsive web interface
- Real-time activity list updates
- Visual participant management
- Success/error feedback messages

🧪 **Testing & Quality**
- 17+ backend tests with 100% pass rate
- Frontend test suite with Jest
- AAA (Arrange-Act-Assert) pattern
- High code coverage

## Quick Start

### Installation

```bash
# Install Python dependencies
pip install -r requirements.txt

# Optional: Install frontend test dependencies
npm install
```

### Running the Application

```bash
# Start the FastAPI server
python src/app.py

# Or using uvicorn directly
uvicorn src.app:app --reload
```

Access the application:
- **Web Interface:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc

### Running Tests

```bash
# Backend tests (pytest)
pytest tests/ -v

# Frontend tests (Jest)
npm test
```

## API Endpoints

| Method | Endpoint                                                          | Status Code | Description                                                         |
| ------ | ----------------------------------------------------------------- | ----------- | ------------------------------------------------------------------- |
| GET    | `/activities`                                                     | 200         | Get all activities with their details and current participant count |
| POST   | `/activities/{activity_name}/signup?email=...`                   | 200/400/404 | Sign up for an activity                                             |
| DELETE | `/activities/{activity_name}/remove?email=...`                   | 200/400/404 | Remove participant from an activity                                 |

### Response Examples

**GET /activities**
```json
{
  "Chess Club": {
    "description": "Learn strategies and compete in chess tournaments",
    "schedule": "Fridays, 3:30 PM - 5:00 PM",
    "max_participants": 12,
    "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
  }
}
```

**POST /activities/Chess Club/signup**
```json
{
  "message": "Signed up test@mergington.edu for Chess Club"
}
```

**Error Response**
```json
{
  "detail": "Already signed up for this activity"
}
```

## Available Activities

### Sports
- **Basketball Team** - Competitive team for league play (Tue & Thu, 4:00 PM - 5:30 PM)
- **Soccer Club** - Recreational soccer for all levels (Wed & Sat, 3:00 PM - 4:30 PM)
- **Gym Class** - Physical education and sports (Mon, Wed, Fri, 2:00 PM - 3:00 PM)

### Artistic
- **Art Club** - Painting, drawing, and techniques (Mon & Wed, 3:30 PM - 5:00 PM)
- **Drama Club** - Theater and performance (Thu, 4:00 PM - 6:00 PM)

### Intellectual
- **Chess Club** - Strategy and tournaments (Fri, 3:30 PM - 5:00 PM)
- **Programming Class** - Fundamentals and projects (Tue & Thu, 3:30 PM - 4:30 PM)
- **Science Club** - Physics, chemistry, and biology (Tue, 3:30 PM - 4:30 PM)
- **Debate Club** - Public speaking and argumentation (Fri, 4:00 PM - 5:30 PM)

## Data Model

### Activities
Each activity has:
- **Description** - What the activity is about
- **Schedule** - When it meets
- **max_participants** - Maximum enrollment
- **participants** - List of student emails currently signed up

### Students
Identified by email:
- Email address (unique identifier)
- Can sign up for multiple activities
- Can be in one activity at a time (current implementation)

## Error Handling

| Scenario | Status | Error Message |
| -------- | ------ | ------------- |
| Activity not found | 404 | "Activity not found" |
| Already signed up | 400 | "Already signed up for this activity" |
| Activity full | 400 | "Activity is full" |
| Not signed up (remove) | 400 | "Student not signed up for this activity" |

## Project Structure

```
.
├── src/
│   ├── app.py                 # FastAPI application
│   ├── static/
│   │   ├── index.html        # Web interface
│   │   ├── app.js            # Frontend logic
│   │   └── styles.css        # Styling
│   └── README.md
├── tests/
│   ├── conftest.py           # Pytest fixtures
│   ├── test_app.py           # Backend tests (17 tests)
│   └── app.test.js           # Frontend tests
├── requirements.txt          # Python dependencies
├── package.json              # Node dependencies
├── jest.config.js            # Jest configuration
└── DEPLOYMENT.md             # Deployment guide
```

## Testing

### Backend Tests (pytest)

17 comprehensive tests covering:
- ✅ Activity retrieval
- ✅ Signup validation (duplicates, capacity, nonexistent activities)
- ✅ Participant removal
- ✅ Capacity management
- ✅ Edge cases (special characters, spaces)

Run with: `pytest tests/ -v`

### Frontend Tests (Jest)

Tests for:
- Activity card display
- Form submission
- Message handling
- Participant deletion
- State management

Run with: `npm test`

## Data Persistence

⚠️ **Current Implementation:** In-memory storage
- All data resets when the server restarts
- Perfect for development and testing

For production, upgrade to:
- PostgreSQL database
- Redis caching
- Persistent file storage

See [DEPLOYMENT.md](../DEPLOYMENT.md) for production setup.

## Deployment

For production deployment options including Docker, Gunicorn, and scaling, see [DEPLOYMENT.md](../DEPLOYMENT.md).

### Quick Deploy (Development)

```bash
python src/app.py
```

### Production Deploy (Recommended)

```bash
gunicorn -w 4 -b 0.0.0.0:8000 src.app:app
```

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Persistent database (PostgreSQL)
- [ ] Email notifications
- [ ] Activity search and filtering
- [ ] Student grade levels and preferences
- [ ] Activity reviews and ratings
- [ ] Admin dashboard
- [ ] Waitlist functionality

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new features
4. Run `pytest tests/ -v` to verify
5. Create a pull request

## License

MIT License - See LICENSE file for details

