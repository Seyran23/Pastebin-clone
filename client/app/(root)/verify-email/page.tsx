"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import InfoBox from '@/components/shared/InfoBox';
import { verifyEmail } from '@/lib/api';
import { useAuthStore } from "@/store/useAuthStore";

const VerifyEmailPage = () => {
  const router = useRouter();
  const params = useSearchParams();
  const { saveAccessToken, saveRefreshToken,  setUserInfo, setIsAuthenticatedState, accessToken } =
    useAuthStore();

  const activationLink = params.get("activationLink");

  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const verifyEmailAndRedirect = async () => {
      try {
        if (!activationLink) {
          throw new Error("Invalid verification link");
        }


        // Call the API to verify the email
        const response = await verifyEmail(activationLink);

        // Save the access token and user info
        saveAccessToken(response.accessToken);
        saveRefreshToken(response.refreshToken);
        setUserInfo(response.user);
        setIsAuthenticatedState(true);

        // Redirect to the profile page
        router.push("/user/profile");
      } catch (error) {
        router.push("/error?type=email-verification");
      }
    };

    verifyEmailAndRedirect();
  }, [accessToken, activationLink, router, saveAccessToken, saveRefreshToken, setIsAuthenticatedState, setUserInfo]);

  // Show an error message if the activation link is missing
  if (!activationLink) {
    return (
      <div className="container max-w-[1024px] mx-auto px-4 text-white">
        <InfoBox variant="error">
          Invalid verification link. Please check your email.
        </InfoBox>
      </div>
    );
  }

  // Show a loading spinner while verifying the email
  return (
    <div className="container max-w-[1024px] mx-auto px-4 text-white">
      <div className="flex justify-center items-center h-screen">
        <Loader2 size={32} className="animate-spin" />
        <p className="ml-4">Verifying your email...</p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
