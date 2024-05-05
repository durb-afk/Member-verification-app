import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  MessageComponentTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest } from './utils.js';
import { readDataFromCSV,writeDataToCSV } from './csvUtils.cjs';
readDataFromCSV();
const student_data = await readDataFromCSV();
writeDataToCSV(student_data);
//console.log(student_data);
//writeDataToCSV(student_data);

// Create and configure express app
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post('/interactions', async function (req, res) {
  // console.log(123)
  // Interaction type and data
  const { type, id, data } = req.body;
  /**
   * Handle slash command requests
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    // Slash command with name of "test"
    console.log(InteractionResponseType)
    const { name } = data
    if (name === 'test') {
      // Send a modal as response
      //data = readDataFromCSV()
      return res.send({
        type: InteractionResponseType.MODAL,
        data: {
          custom_id: 'Student_Number',
          title: 'Verify Student Number',
          components: [
            {
              // Text inputs must be inside of an action component
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  // See https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure
                  type: MessageComponentTypes.INPUT_TEXT,
                  custom_id: 'Enter_ID',
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

  /**
   * Handle modal submissions
   */
  if (type === InteractionType.MODAL_SUBMIT) {
    // custom_id of modal
    const modalId = data.custom_id;
    // user ID of member who filled out modal
    const userId = req.body.member.user.id;

    if (modalId === 'Student_Number') {
      let modalValues = '';
      // Get value of text inputs
      for (let action of data.components) {
        let inputComponent = action.components[0];
        modalValues += `${inputComponent.value}\n`;
      }
      student_data.forEach((data1) => {
        if (data1.StudentID === modalValues) {
          if (data1.DISCORD === ''){
            data1.DISCORD = userId;
          }
          else{
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `The ${userId} is already verified`,
              },
            });
          }
        }else{
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `The ${userId} is not a valid student`,
            },
          });
        }
      });
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `<@${userId}> typed the following (in a modal):\n\n${modalValues}`,
        }, 
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
