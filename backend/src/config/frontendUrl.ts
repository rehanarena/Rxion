import dotenv from "dotenv";
dotenv.config();
export const link_one =
  process.env.NODE_ENV === "PRODUCTION"
    ? process.env.PRODUCTION_CLEINT_LINK_ONE
    : process.env.DEV_CLEINT_LINK_ONE;
export const link_two =
  process.env.NODE_ENV === "PRODUCTION"
    ? process.env.PRODUCTION_CLEINT_LINK_TWO
    : process.env.DEV_CLEINT_LINK_TWO;
