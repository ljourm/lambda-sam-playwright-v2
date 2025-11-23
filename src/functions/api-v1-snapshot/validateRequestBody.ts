import Ajv from "ajv";

import type { eventRequestBody } from "./types";

const ajv = new Ajv({ allErrors: true });

const requestBodySchema = {
  type: "object",
  properties: {
    baseUrl: { type: "string" },
    targets: {
      type: "array",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          width: { type: "number" },
          fullPage: { type: "boolean" },
          beforeEvaluate: { type: "string" },
        },
        required: ["path", "width"],
        additionalProperties: false,
      },
    },
  },
  required: ["baseUrl", "targets"],
  additionalProperties: false,
};

export const validateRequestBody = ajv.compile<eventRequestBody>(requestBodySchema);
