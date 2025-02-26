import { useEffect, useState } from "react";
import { GOOGLE_API_KEY } from "src/constants";

export const useScripts = () => {
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [paymentScriptLoaded, setPaymentScriptLoaded] = useState(false);

  useEffect(() => {
    const googleScript = document.createElement("script");
    googleScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=drawing,geometry,places`;
    window.document.body.appendChild(googleScript);
    googleScript.addEventListener("load", () => {
      console.log("GoogleMap script loaded");
      setMapScriptLoaded(true);
    });

    const razorPayScript = document.createElement("script");
    razorPayScript.src = `https://checkout.razorpay.com/v1/checkout.js`;
    window.document.body.appendChild(razorPayScript);

    razorPayScript.addEventListener("load", () => {
      console.log("Razorpay script loaded");
      setPaymentScriptLoaded(true);
    });
  }, []);

  return { mapScriptLoaded, paymentScriptLoaded };
}
