import { z } from "zod";

export const youtubeVideoRegex = new RegExp(
  `(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})`
);

export const videoUrlValidator = z.string().url().regex(youtubeVideoRegex);
export type VideoUrl = z.infer<typeof videoUrlValidator>;

export const boardNameValidator = z.enum(["slowed_reverb", "pitch_shift"]);
export type BoardName = z.infer<typeof boardNameValidator>;

export const boardValidator = z.union([
  z.tuple([z.literal("slowed_reverb"), z.enum(["085", "08", "07"])]),
  z.tuple([z.literal("pitch_shift"), z.enum(["35_08", "45_08", "55_08"])]),
]);
export type Board = z.infer<typeof boardValidator>;

export const requiredIdentifierValidator = z.object({
  url: z.string().min(1),
  board_name: boardValidator,
});
export type RequiredIdentifier = z.infer<typeof requiredIdentifierValidator>;

const statusResponseEQSTATUSValidator = z.object({
  stage: z.enum(["downloading", "processing", "uploading"]),
  percentage: z.number().min(0).max(100).nullable(),
});

export const statusResponseValidator = z.discriminatedUnion("state", [
  requiredIdentifierValidator.extend({
    state: z.literal("STARTED"),
    cancelled: z.literal(false),
    failed: z.literal(false),
    result: z.null(),
    status: z.null(),
  }),
  requiredIdentifierValidator.extend({
    state: z.literal("IN_PROGRESS"),
    cancelled: z.literal(false),
    failed: z.literal(false),
    result: z.null(),
    status: statusResponseEQSTATUSValidator,
  }),
  requiredIdentifierValidator.extend({
    state: z.literal("DONE"),
    cancelled: z.boolean(),
    failed: z.boolean(),
    result: z.string().url().nullable(),
    status: z.null(),
  }),
]);
export type StatusResponse = z.infer<typeof statusResponseValidator>;

export const ErrorResponseValidator = z.object({
  message: z.string(),
  code: z.number(),
  disconnected: z.boolean().default(false),
});

export const serverResponseValidator = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("STATUS"),
    data: statusResponseValidator,
  }),
  z.object({
    op: z.literal("INTERNAL_ERROR"),
    data: ErrorResponseValidator,
  }),
]);
export type ServerResponse = z.infer<typeof serverResponseValidator>;

export const serverRequestValidator = z.object({
  op: z.enum(["INIT", "STATUS", "CANCEL"]),
  data: requiredIdentifierValidator,
});
export type ServerRequest = z.infer<typeof serverRequestValidator>;

export const boards = [
  boardValidator.parse(["slowed_reverb", "085"]),
  boardValidator.parse(["slowed_reverb", "08"]),
  boardValidator.parse(["slowed_reverb", "07"]),
  boardValidator.parse(["pitch_shift", "35_08"]),
  boardValidator.parse(["pitch_shift", "45_08"]),
  boardValidator.parse(["pitch_shift", "55_08"]),
] as const;

export const getBoardDescription = (board: Board | BoardName) => {
  let name: BoardName;
  if (board instanceof Array) {
    const [boardName] = board;
    name = boardName;
  } else {
    name = board;
  }

  switch (name) {
    case "slowed_reverb":
      return "A reverb with a slow decay time (long durations).";

    case "pitch_shift":
      return "A pitch shifter with a reverb (same durations).";
  }
};

export const getBoardName = (board: Board) => {
  const [boardName, boardType] = board;
  switch (boardName) {
    case "slowed_reverb":
      switch (boardType) {
        case "085":
          return "Slowed Reverb - Low";
        case "08":
          return "Slowed Reverb - Medium";
        case "07":
          return "Slowed Reverb - High";
      }

    case "pitch_shift":
      switch (boardType) {
        case "35_08":
          return "Pitch Shift - Low";
        case "45_08":
          return "Pitch Shift - Medium";
        case "55_08":
          return "Pitch Shift - High";
      }
  }
};
