import { useUser, useWallet } from "@civic/auth-web3/react";

export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useUser();
  const { address } = useWallet({ type: "ethereum" });

  return {
    user,
    isAuthenticated,
    isLoading,
    walletAddress: address,
  } as const;
};
