# User Creation Event Handler (Cloud Function)

## Overview
This is a **Google Cloud Run Function (2nd Gen)** that handles user-related events asynchronously. It is designed to decouple the primary User Microservice from secondary background tasks.

## Architecture
1. **Trigger**: Triggered by a Pub/Sub message on the `user-created-event` topic.
2. **Publisher**: The `users-microservice` emits an event containing the `user_id`, `name`, and `email` after a successful database write.
3. **Subscriber**: This function (the subscriber) decodes the Base64 data and processes the event.

## Local Development & Testing
To run and test this function locally:
1. Navigate to this folder: `cd user-creation-function`
2. Install dependencies: `npm install`
3. Start the framework: 
   ```bash
   npx functions-framework --target=handleUserCreation --signature-type=cloudevent --port=8081

## Production Infrastructure Setup (Google Cloud Console)
To make this function work in a live environment, the following infrastructure must be configured:
1. **Pub/Sub Topic**: Create a topic named `user-created-event` in the GCP Console.
2. **Push Subscription**: Create a subscription for the topic. If using Cloud Run Functions (2nd Gen), simply select "Cloud Pub/Sub" as the trigger during function deployment, and Google will handle the wiring automatically.
3. **IAM Roles**: Ensure the service account running the User Microservice has the `Pub/Sub Publisher` role.