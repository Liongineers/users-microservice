const functions = require('@google-cloud/functions-framework');

/*
 * This function is triggered by a Pub/Sub message.
 */
functions.cloudEvent('handleUserCreation', cloudEvent => {
  // Data in Pub/Sub arrives base64 encoded.
  const base64Data = cloudEvent.data.message.data;
  const decodedString = base64Data ? Buffer.from(base64Data, 'base64').toString() : '{}';
  
  // Parse the string into a JSON object
  const user = JSON.parse(decodedString);

  console.log('CLOUD FUNCTION TRIGGERED SUCCESSFULLY!');
  console.log(`Processed new user: ${user.name}`);
  console.log(`User Email: ${user.email}`);
  console.log(`User ID: ${user.user_id}`);
});