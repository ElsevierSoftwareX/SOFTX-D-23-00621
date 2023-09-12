.PHONY: help install-dev start stop deploy test upload-package-to-s3 package-for-deploy validate-yaml upgrade control

.DEFAULT_GOAL := help

## Run the web application on port 3000.
## Should be run manually if package.json changed.
start:
	@docker compose up --build --remove-orphans

## Stop the web application.
stop:
	@docker compose down --volumes

## Deploy the web application to the remote server. Requires password to FTP.
build:
	@docker compose run --rm iva npm run build

## Run the existing tests.
test:
	@docker compose run --rm iva npm run test

## Convenient task to upload packaged videos to the AWS S3 buckets.
## Requires argument: ARGS="<path/to/package.zip>"
upload-package-to-s3:
	@./scripts/upload-package-to-s3.sh "$(ARGS)"

## Convenient task to package the final video into a ZIP file ready to be deployed in AWS.
## Requires argument: ARGS="<path/to/video_directory>"
package-for-deploy:
	@./scripts/package-for-deploy.sh "$(ARGS)"

## Convenient task to validate a video sequence definition YAML file.
## Requires argument: ARGS="<path/to/file.yml>"
## (path is relative to ./)
validate-yaml:
	@docker compose run --rm iva npx pajv -m public/schemas/draft-07.schema.json \
	-s public/schemas/iva-sequence-definition.schema.json \
	-r public/schemas/'*-vc.schema.json' \
	-d $(ARGS)

## This help message.
help:
	@printf "Usage:\n";
	@printf "  make \033[36m<target>\033[0m [args]\n\n"

	@awk '{ \
			if ($$0 ~ /^.PHONY: [a-zA-Z\-\_0-9]+$$/) { \
				helpCommand = substr($$0, index($$0, ":") + 2); \
				if (helpMessage) { \
					printf "\033[36m%-20s\033[0m %s\n", \
						helpCommand, helpMessage; \
					helpMessage = ""; \
				} \
			} else if ($$0 ~ /^[a-zA-Z\-\_0-9.]+:/) { \
				helpCommand = substr($$0, 0, index($$0, ":")); \
				if (helpMessage) { \
					printf "\033[36m%-20s\033[0m %s\n", \
						helpCommand, helpMessage; \
					helpMessage = ""; \
				} \
			} else if ($$0 ~ /^##/) { \
				if (helpMessage) { \
					helpMessage = helpMessage"\n                     "substr($$0, 3); \
				} else { \
					helpMessage = substr($$0, 3); \
				} \
			} else { \
				if (helpMessage) { \
					print "\n                     "helpMessage"\n" \
				} \
				helpMessage = ""; \
			} \
		}' \
		$(MAKEFILE_LIST)
