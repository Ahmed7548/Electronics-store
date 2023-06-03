import { Schema, model } from "mongoose";

const timeToLive = process.env.REFRESH_TOKEN_TTL
  ? +process.env.REFRESH_TOKEN_TTL
  : 60 * 60 * 24;

interface BandTokensIN {
  refreshToken: string;
  bannedAt: Date;
}

const BannedTokensSchema = new Schema<BandTokensIN>({
  refreshToken: {
    type: String,
    required: true,
  },
  bannedAt: {
    type: Date,
    required: true,
    index: { expires: timeToLive },
  },
});

const BannedTokens = model<BandTokensIN>("BannedTokens", BannedTokensSchema);

export default BannedTokens;
