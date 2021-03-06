# Cam Screenshot App

A simple and light react web application that allows to take a picture from your device camera and send it to a backend server.

![image](cam_screenshot_app.png)

There are two mandatory checkboxes (for privacy, marketing, and so on ;) ) linked with two fake documents. They are just an example, because their values will not saved anywhere (we have no database here).

## Basic setup

### Frontend

#### Install node modules

```
yarn install
```

#### Update Env

```
cp .env.example .env
```

- If you are running the system as is, leave the default values for environment

#### Run - Development

```
yarn start
```

- Navigate to local developement server (`http://localhost:3000`)

#### Run - Production

```
yarn build
yarn global add serve
serve -s build
```

- Navigate to static production server (usually `http://localhost:5000`)

### Backend

#### Install node modules

```
yarn install
```

#### Run

```
yarn start
```

- Your local upload server is running on `http://localhost:5000`
