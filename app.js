import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import {
  InteractionType,
  InteractionResponseType,
  MessageComponentTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest } from './utils.js';
import { 
  rawDataFilePath, 
  databaseFilePath, 
  readDataFromCSV, 
  readDataFromJSON, 
  writeDataToJSON 
} from './csvUtils.cjs';

// Load student data
const studentData = fs.existsSync(databaseFilePath) 
  ? await readDataFromJSON(databaseFilePath)
  : await readDataFromCSV(rawDataFilePath)

// Create and configure express app
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware to verify Discord requests
app.use(express.json({ 
  verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) 
}));

app.post('/interactions', async function (req, res) {
  const { type, id, data } = req.body;

  // Handle verification requests
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  // Handle slash command interactions
  if (type === InteractionType.APPLICATION_COMMAND) {
    // Slash command with name of "test"
    const { name } = data

    if (name === 'verify') {
      // Create a modal for users to enter their student number
      return res.send({
        type: InteractionResponseType.MODAL,
        data: {
          custom_id: 'student_id',
          title: 'Verify with Student ID',
          components: [
            {
              // Text inputs must be inside of an action component
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  // See https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure
                  type: MessageComponentTypes.INPUT_TEXT,
                  custom_id: 'enter_id',
                  style: 1,
                  label: 'Enter your student number',
                  required : true,
                  min_length  : 7,
                  max_length : 7,
                },
              ],
            }
          ],
        },
      });
    }
  }
  
  // Handle modal interactions
  if (type === InteractionType.MODAL_SUBMIT) {
    // custom_id of modal
    const modalId = data.custom_id;
    // user ID of member who filled out modal
    const userId = req.body.member.user.id;

    if (modalId === 'student_id') {
      // Get value of text inputs
      // See modal response above for nested object structure
      const inputValue = data.components[0].components[0].value;

      // Find inputValue in student IDs
      for (let i=0; i<studentData.length; i++){
        const data = studentData[i];

        if (data.StudentID === inputValue) {
          if (data.DISCORD === ''){
            // Set Discord ID if user is not already verified
            data.DISCORD = userId;

            // Write the updated data to the CSV file
            await writeDataToJSON(studentData);

            // Show success message
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `Successfully verified ${userId} as ${inputValue}`,
              },
            });
          } else {
            // Show error message if the user is already verified
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `The ${userId} is already verified`,
              },
            });
          }
        }
      }

      // Show error message if the input value is not a valid student ID,
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `The ${userId} is not a valid student`,
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
