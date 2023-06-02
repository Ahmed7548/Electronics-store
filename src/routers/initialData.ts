import express from "express";
import catchAsycError from "../utils/helpers/catchAsycError";
import { getInitialData } from "../controllers/initialData/initialData";
import { validate } from "../middlewares/validator";
import { initialDataShema } from "../json-schemas/schemas/initialData";

const router = express.Router();

router.get(
  "/initialData",
  validate({ schema: initialDataShema, whatToValidate: "body" }),
  catchAsycError(getInitialData)
);
