import axios from "axios";

interface Question {
  question: string;
}

export const fetchFlowiseResponse = async (question: Question) =>
  await axios.post<string>(process.env.FLOWISE_API_URL!, question, {
    headers: {
      Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
