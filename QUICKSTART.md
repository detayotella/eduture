# EDUTURE Enhancement - Quick Start Guide

## 🚀 Get Started in 30 Minutes

This guide helps you set up the enhanced EDUTURE system with RL-based adaptation.

---

## Prerequisites

- Python 3.8+
- pip package manager
- Basic knowledge of Python
- (Optional) Node.js for frontend

---

## Step 1: Environment Setup (5 minutes)

```bash
# Create project directory
mkdir eduture-rl
cd eduture-rl

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install numpy scipy scikit-learn fastapi uvicorn sqlalchemy
```

---

## Step 2: Project Structure (2 minutes)

Create this folder structure:

```
eduture-rl/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── engines/
│   │   │   ├── __init__.py
│   │   │   ├── rule_based.py
│   │   │   └── contextual_bandit.py  <- Copy from provided file
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── reward.py
│   └── requirements.txt
├── tests/
│   └── test_bandit.py
└── data/
    └── icdl_content.json
```

---

## Step 3: Copy Implementation Files (2 minutes)

1. Copy `contextual_bandit_implementation.py` to `backend/app/engines/contextual_bandit.py`
2. Copy `ab_testing_framework.py` to `backend/app/utils/ab_testing.py`

---

## Step 4: Create Minimal API (10 minutes)

Create `backend/app/main.py`:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Import your engines
from engines.contextual_bandit import AdaptiveEngine, LearnerState, RewardCalculator
from utils.ab_testing import ABTestManager, LearnerMetrics

app = FastAPI(title="EDUTURE RL API")

# Initialize engines
rule_engine = AdaptiveEngine(mode='rule')
rl_engine = AdaptiveEngine(mode='rl', alpha=1.0)
ab_manager = ABTestManager()

# Data models
class LearnerRequest(BaseModel):
    learner_id: str
    learning_style: str  # activist, reflector, theorist, pragmatist
    time_on_task: float = 0.5
    error_rate: float = 0.2
    revisit_count: float = 0.1
    completion_rate: float = 0.0
    engagement_score: float = 0.5
    topic_difficulty: float = 0.5

class InteractionRequest(BaseModel):
    learner_id: str
    content_type: str
    completed: bool
    quiz_score: float
    expected_time: float
    actual_time: float
    is_revisit: bool

# API Endpoints
@app.post("/assign")
def assign_learner(request: LearnerRequest):
    """Assign learner to control or treatment group"""
    group = ab_manager.assign_learner(
        request.learner_id, 
        request.learning_style
    )
    return {
        "learner_id": request.learner_id,
        "group": group,
        "message": f"Assigned to {group} group"
    }

@app.post("/recommend")
def get_recommendation(request: LearnerRequest):
    """Get next content recommendation"""
    # Determine which engine to use
    group = ab_manager.assignments.get(request.learner_id)
    if not group:
        group = ab_manager.assign_learner(request.learner_id, request.learning_style)
    
    engine = rl_engine if group.value == 'rl_based' else rule_engine
    
    # Create learner state
    state = LearnerState(
        learner_id=request.learner_id,
        time_on_task=request.time_on_task,
        error_rate=request.error_rate,
        revisit_count=request.revisit_count,
        completion_rate=request.completion_rate,
        engagement_score=request.engagement_score,
        learning_style=request.learning_style,
        topic_difficulty=request.topic_difficulty
    )
    
    # Get recommendation
    content_type = engine.get_next_content(state)
    
    return {
        "learner_id": request.learner_id,
        "group": group.value,
        "recommended_content": content_type,
        "mode": "rl_based" if group.value == 'rl_based' else 'rule_based'
    }

@app.post("/feedback")
def record_feedback(request: InteractionRequest):
    """Record learner interaction and update RL model"""
    # Calculate reward
    reward_data = {
        'completed': request.completed,
        'quiz_score': request.quiz_score,
        'expected_time': request.expected_time,
        'actual_time': request.actual_time,
        'is_revisit': request.is_revisit
    }
    reward = RewardCalculator.calculate(reward_data)
    
    # Update RL engine
    state = LearnerState(
        learner_id=request.learner_id,
        time_on_task=0.5,  # Simplified
        error_rate=0.2,
        revisit_count=0.1,
        completion_rate=0.5,
        engagement_score=0.5,
        learning_style='activist',  # Would be fetched from DB
        topic_difficulty=0.5
    )
    
    rl_engine.record_interaction(state, request.content_type, reward)
    
    return {
        "learner_id": request.learner_id,
        "content_type": request.content_type,
        "reward": reward,
        "message": "Feedback recorded"
    }

@app.get("/stats")
def get_statistics():
    """Get A/B test statistics"""
    return ab_manager.get_summary_stats()

@app.get("/")
def root():
    return {"message": "EDUTURE RL API is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Step 5: Run the API (2 minutes)

```bash
cd backend
python -m app.main
```

You should see:
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

Test it:
```bash
curl http://localhost:8000/
```

Response:
```json
{"message": "EDUTURE RL API is running"}
```

---

## Step 6: Test the Flow (5 minutes)

### 1. Assign a learner
```bash
curl -X POST http://localhost:8000/assign \
  -H "Content-Type: application/json" \
  -d '{
    "learner_id": "student_001",
    "learning_style": "activist"
  }'
```

### 2. Get content recommendation
```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "learner_id": "student_001",
    "learning_style": "activist",
    "completion_rate": 0.3
  }'
```

### 3. Record feedback
```bash
curl -X POST http://localhost:8000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "learner_id": "student_001",
    "content_type": "activity",
    "completed": true,
    "quiz_score": 85,
    "expected_time": 10,
    "actual_time": 12,
    "is_revisit": false
  }'
```

### 4. Check stats
```bash
curl http://localhost:8000/stats
```

---

## Step 7: Run the Demo Simulation (4 minutes)

Test the full implementation:

```bash
# Test contextual bandit
python backend/app/engines/contextual_bandit.py

# Test A/B framework
python backend/app/utils/ab_testing.py
```

---

## Next Steps

### Week 1-2: Foundation
- [ ] Set up database (PostgreSQL/SQLite)
- [ ] Create learner authentication
- [ ] Port ICDL content to database
- [ ] Build Honey & Mumford questionnaire

### Week 3-4: Rule-Based Engine
- [ ] Implement original EDUTURE algorithm
- [ ] Create content fragment structure
- [ ] Build basic frontend

### Week 5-7: RL Engine
- [ ] Integrate Contextual Bandit
- [ ] Design reward function
- [ ] Add exploration mechanism
- [ ] Test with synthetic data

### Week 8-10: A/B Testing
- [ ] Random assignment logic
- [ ] Data collection pipeline
- [ ] Analytics dashboard
- [ ] Statistical analysis tools

### Week 11-14: Evaluation
- [ ] Recruit 60+ learners
- [ ] Run study (2 weeks)
- [ ] Collect and analyze data
- [ ] Write results chapter

---

## Common Issues & Solutions

### Issue: "Module not found"
**Solution:** Make sure you're in the virtual environment and installed all packages.

### Issue: "Port already in use"
**Solution:** Kill existing process or change port:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Use different port
```

### Issue: "RL not learning"
**Solution:** 
- Check reward values are between 0-1
- Increase exploration (alpha parameter)
- Ensure sufficient data (at least 10 interactions)

---

## File Checklist

Download these files to your project:
- [ ] `contextual_bandit_implementation.py` → `engines/`
- [ ] `ab_testing_framework.py` → `utils/`
- [ ] `EDUTURE_Enhancement_Plan.md` → Reference
- [ ] `QUICKSTART.md` → This file

---

## Resources

### Documentation
- FastAPI: https://fastapi.tiangolo.com/
- Contextual Bandits: https://arxiv.org/abs/1003.0146
- A/B Testing: https://www.evanmiller.org/ab-testing/

### Similar Projects
- OpenEdX Adaptive Learning
- Knewton (adaptive learning platform)
- Carnegie Learning (cognitive tutor)

---

## Need Help?

Common questions:

**Q: Do I need to rebuild the entire EDUTURE system?**
A: No! Start with the API and integrate with your existing frontend.

**Q: How much data do I need for RL to work?**
A: Minimum 10-20 interactions per learner. More is better!

**Q: What if RL performs worse than rules?**
A: That's still a valid result! Frame it as "validating rule-based design."

**Q: Can I use this for my thesis?**
A: Absolutely! This is a solid research contribution for undergrad level.

---

## Success Criteria

✅ **Minimum viable:** Working API with both engines  
✅ **Good:** 30+ learners in A/B test  
✅ **Excellent:** Statistically significant results  
✅ **Outstanding:** Publication-worthy findings  

---

**You're ready to start! 🚀**

Begin with Step 1 and work through each step. You've got this!
