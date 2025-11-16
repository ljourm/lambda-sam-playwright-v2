import Ajv from "ajv";

const ajv = new Ajv.default({ allErrors: true });

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
        },
        required: ["path", "width"],
        additionalProperties: false,
      },
    },
  },
  required: ["baseUrl", "targets"],
  additionalProperties: false,
};

export const validateRequestBody = ajv.compile(requestBodySchema);
