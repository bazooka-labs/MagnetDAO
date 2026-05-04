import { MAGNET_TOKEN } from "@/lib/constants";

export interface LiquidityApplication {
  txId: string;
  submitter: string;
  submittedAt: number;
  name: string;
  asaTitle: string;
  asaId: number;
  description: string;
  contact: string;
}

export interface VotingProposal {
  id: number;
  question: string;
  choices: string[];   // 2–4 non-empty strings
  votes: number[];     // parallel to choices, total Magnet weight per choice
  startTime: number;
  endTime: number;
}

export interface VoterRecord {
  proposalId: number;
  choice: number;
  lockedAmount: number;
}

export interface Proposal {
  id: number;
  quarter: number;
  projectName: string;
  liquidityPair: string;
  capitalRequested: number;
  timelineDays: number;
  riskHash: string;
  submitter: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  createdAt: number;
}

export enum ProposalStatus {
  PENDING = 1,
  VOTING = 2,
  APPROVED = 3,
  REJECTED = 4,
  DEPLOYED = 5,
}

export interface Deployment {
  id: number;
  proposalId: number;
  projectAsaId: number;
  amount: number;
  dexName: string;
  deployer: string;
  status: DeploymentStatus;
  timestamp: number;
  txId?: string;
}

export enum DeploymentStatus {
  PENDING = 1,
  ACTIVE = 2,
  WITHDRAWN = 3,
}

export interface Vote {
  voter: string;
  proposalId: number;
  quarter: number;
  weight: number;
  direction: boolean; // true = for, false = against
}

export interface TreasuryState {
  totalFunded: number;
  totalDeployed: number;
  balance: number;
  deploymentCount: number;
  totalFeesHarvested: number;
}

export interface GovernanceState {
  currentQuarter: number;
  quarterStart: number;
  proposalCount: number;
  votingOpen: boolean;
  quarterSeconds: number;
}

export interface DaoConfig {
  governanceAppId: number;
  treasuryAppId: number;
  magnetAsaId: number;
  network: "testnet" | "mainnet";
}

export const MAGNET_DAO_CONFIG: DaoConfig = {
  governanceAppId: 0,
  treasuryAppId: 0,
  magnetAsaId: MAGNET_TOKEN.asaId,
  network: "testnet",
};

export const PROPOSAL_STATUSES: Record<ProposalStatus, string> = {
  [ProposalStatus.PENDING]: "Pending",
  [ProposalStatus.VOTING]: "Voting",
  [ProposalStatus.APPROVED]: "Approved",
  [ProposalStatus.REJECTED]: "Rejected",
  [ProposalStatus.DEPLOYED]: "Deployed",
};

export const DEPLOYMENT_STATUSES: Record<DeploymentStatus, string> = {
  [DeploymentStatus.PENDING]: "Pending",
  [DeploymentStatus.ACTIVE]: "Active",
  [DeploymentStatus.WITHDRAWN]: "Withdrawn",
};
