import { trainers } from "@/constants/product";
import type { TrainerId } from "@/types";

export function getTrainerQuote(trainerId: TrainerId) {
  return trainers.find((trainer) => trainer.id === trainerId)?.quote ?? trainers[0].quote;
}
