export type Investor = {
  name: string;
  type: string;
  country: string;
  totalCommitment: number;
  dateAdded: string;
};

export type Commitment = {
  amount: number;
  assetClass: string;
  dateAdded: string;
  lastUpdated: string;
};

type AssetsTotal = {
  assetClass: string;
  totalAmount: number;
  numberOfCommitments: number;
};

export type InvestorDetails = {
  assetsTotals: AssetsTotal[];
  commitments: Commitment[];
  totalAmount: number;
};
