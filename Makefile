DOCKER_COMPOSE_CMD := docker-compose -f docker-compose.yml

APP_INDEX_FILE := index.js
APP_SERVICE_NAME := starrail-auto

run:
	node $(APP_INDEX_FILE)

run-once:
	node $(APP_INDEX_FILE) --sign

install:
	npm install

start:
	$(DOCKER_COMPOSE_CMD) up -d

up: start

shell:
	$(DOCKER_COMPOSE_CMD) exec -it $(APP_SERVICE_NAME) sh

stop:
	$(DOCKER_COMPOSE_CMD) down --remove-orphans

down: stop

logs:
	$(DOCKER_COMPOSE_CMD) logs --tail 100

logsf:
	$(DOCKER_COMPOSE_CMD) logs --tail 100 -f


status:
	$(DOCKER_COMPOSE_CMD) ps -a

stats:
	docker stats

restart: stop start

build:
	$(DOCKER_COMPOSE_CMD) build

buildnc:
	$(DOCKER_COMPOSE_CMD) build --no-cache
	
__clean:
	$(DOCKER_COMPOSE_CMD) down -v --remove-orphans