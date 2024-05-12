import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const VERIFY = {
  name: 'verify',
  description: 'Verify your DS Cubed Membership',
  type: 1,
};

const ALL_COMMANDS = [
  VERIFY
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);