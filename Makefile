.PHONY: dev redis seed reset test test-agents lint

dev:
	.venv/bin/python -m uvicorn app.main:app --reload --port 8000

redis:
	docker run -d --name contractiq-redis -p 6379:6379 redis/redis-stack

seed:
	python scripts/seed_demo.py

reset:
	python scripts/reset_demo.py

test:
	pytest tests/

test-agents:
	python scripts/test_agents.py

lint:
	ruff check app/ scripts/ tests/

pipeline:
	python scripts/run_pipeline.py
