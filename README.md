# Interactive Video Application (IVA)

## Quick start

1. Install Docker.
2. Run `$ make start` to run the development server.
3. Create a path like **public/videos/my_video/{video.mp4,isd.yml}** with both the video and the ISD file.
4. Go to *http://localhost:3000* and enter the name of the new directory along with the *.local* extension to test the video (e.g. *my_video.local*).
5. Reload the website to refresh your changes to the *isd.yml* file.
6. Once happy with the result, package the video and its dependencies running the task *package-for-deploy* with make (e.g. `$ ARGS=public/videos/videoexample01 make package-for-deploy`).
7. Then, you can publish the interactive video running the task *upload-package-to-s3* with make (e.g. `$ ARGS=20190607_my_video.zip make upload-package-to-s3`).

## Development

### Dependencies

- Docker:
    - [Windows](https://docs.docker.com/desktop/install/windows-install/)
    - [macOS](https://docs.docker.com/desktop/install/mac-install/)
    - [Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [Optional] A server to host IVA.
- [Optional] An AWS account and a S3 container to upload the videos. Then, the next env variables:
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
    - AWS_DEFAULT_REGION
    - AWS_IVA_CONTENT_URL (The base URL where IVA is being hosted)
        - The variable `baseUrl` in _App.jsx_ must be set to this same variable too.
    - AWS_IVA_CONTENTS_S3_PATH (For example: `s3://iva-contents`)

### Usage

This project was created using the [create-react-app](https://facebook.github.io/create-react-app/) tool and wrapped into a Docker container for easier development.

Run `$ make` to get a list of available commands that can be run, along with their help:

- **`$ make start`**
    - Run the web application on port 3000.
    - Should be run manually if package.json changed.
- **`$ make stop`**
    - Stop the web application.
- **`$ make build`**
    - Build the web application.
- **`$ make test`**
    - Run the existing tests (if any).
- **`$ make upload-package-to-s3`**
    - Convenient task to upload packaged videos to the AWS S3 buckets.
    - Requires argument: `ARGS="<path/to/package.zip>"`
- **`$ make package-for-deploy`**
    - Convenient task to package the final video into a ZIP file ready to be deployed in AWS.
    - Requires argument: `ARGS="<path/to/video_directory>"`
- **`$ make validate-yaml`**
    - Convenient task to validate a video sequence definition YAML file.
    - Requires argument: `ARGS="<path/to/file.yml>"`

Run the command `$ make start` to run the application. Then, go to *http://localhost:3000/* to load a video. To stop the webapp, just run the command `$ make stop`.

### Loading videos

Videos can be loaded in two ways:

- Remotely from AWS:
    - After packaging and uploading a video to the AWS S3, you will get a hash ID. You can use it in IVA to load the video from AWS.
- Locally from disk:
    1. Create a directory in the */public/videos/* directory with the name of the video (e.g. */public/videos/my_video/*).
        - **Note**: The **/** directory references the IVA project root.
    2. Copy the */public/schemas/isd.example.yml* into the new directory with the name *isd.yml* and change it as you want.
        - Validate the *isd.yml* file against the schemas running the task *validate-yaml* with make (e.g. `$ make validate-yaml ARGS="public/videos/my_video/isd.yml"`).
    3. Put your video file in the new directory with the name *video.mp4* (e.g. */public/videos/my_video/video.mp4*).
    4. Create any new files referenced by the *isd.yml* file into a directory tree like *static/{img,css,js,pages}* (e.g. */public/videos/my_video/static/pages/iframe-example.html*).
        - **Note**: **All referenced routes** in the *isd.yml* file and any others (*.css*, *.js*, etc) **MUST BE absolute** (e.g. prefix them with *http://localhost:3000/videos/my_video/*).