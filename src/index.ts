import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import {
  GatewayDispatchEvents,
  GatewayIntentBits,
  Client,
  RESTPostAPIChannelMessageJSONBody,
} from "@discordjs/core";
import dotenv from "dotenv";
import { fetchFlowiseResponse } from "./services/fetchFlowiseResponse";

dotenv.config();
// Create REST and WebSocket managers directly
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);

const gateway = new WebSocketManager({
  token: process.env.TOKEN!,
  intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
});

// Create a client to emit relevant events.
const client = new Client({ rest, gateway });

// Listen for interactions
// Each event contains an `api` prop along with the event data that allows you to interface with the Discord REST API

const GENERAL_DYSON: string = "<@984224777722007642>";

client.on(
  GatewayDispatchEvents.MessageCreate,
  async ({ data: interaction, api }) => {
    if (interaction.author.bot) return; // Ignore messages from bots
    if (!interaction.content.startsWith(GENERAL_DYSON)) return; // Ignore messages not starting with '@Bot'

    const content = interaction.content.slice(GENERAL_DYSON.length).trim();
    if (!content) {
      console.log("returning");
      return;
    } // Ignore messages without content

    try {
      await api.channels.showTyping(interaction.channel_id);
      const response = await fetchFlowiseResponse({ question: content });

      // Send the API response back to the user
      await api.channels.createMessage(interaction.channel_id, {
        content: response.data,
      } as RESTPostAPIChannelMessageJSONBody);
    } catch (error) {
      console.error("Error making API request:", error);
      await api.channels.createMessage(interaction.channel_id, {
        content: "An error occurred while processing your request.",
      } as RESTPostAPIChannelMessageJSONBody);
    }
  },
);

// Listen for the ready event
client.once(GatewayDispatchEvents.Ready, async () => {
  console.log("Ready!");
});

// Start the WebSocket connection.
gateway.connect();
