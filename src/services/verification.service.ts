import { api } from './api';

export const verificationService = {
  verifyBlockchainRequest: async (requestId: string) => {
    const response = await api.get(`/blockchain/requests/${requestId}/verify`);
    return response.data;
  },
};
