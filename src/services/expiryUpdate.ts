import http from "./httpCall";
import apis from "./apis";

export interface ExpiryInfo {
  isExpiringSoon: boolean;
  daysLeft: number;
  message?: string;
}

export async function getUserExpirationInfo(user: any): Promise<ExpiryInfo | null> {
  const today = new Date();
  let expiryDate: Date | null = null;

  const userType = user?.userType;

  if (userType === "tenant-root") {
    try {
      const tenantRes = await http.get(apis.FETCH_ORGANISATION_BASIC_DETAILS);
  
      if (!tenantRes.data.status) {
        console.error("Error fetching tenant details:", tenantRes.data.message);
        return null;
      }
  
      const start = tenantRes.data.data?.packageStartDate;
      const packageId = tenantRes.data.data?.activePackage;
     
  
      if (start && packageId) {
        const res = await http.get(apis.FETCH_PACKAGE_BY_ID, {
          params: { id: packageId },
        });
  
        if (res.data.status) {
          const duration = res.data.data?.duration;
  
          if (duration) {
            const startDate = new Date(start);
            expiryDate = new Date(startDate);
            expiryDate.setDate(startDate.getDate() + duration);
          }
        } else {
          console.error("Package API error:", res.data.message);
          return null;
        }
      }
    } catch (err) {
      console.error("Error during tenant/package API calls:", err);
      return null;
    }
  }
  
  else if (userType === "tenant-client" || userType === "tenant-staff") {
    const expiry = user?.expiryDatee;
    if (expiry) {
      expiryDate = new Date(expiry);
    } else if (userType === "tenant-staff") {
      return null;
    }
  }

  if (!expiryDate) return null;

  const diff = expiryDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 3600 * 24));

  return {
    isExpiringSoon: daysLeft <= 16,
    daysLeft,
    message:
      daysLeft <= 7
        ? `⚠️ Your account will expire in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Please renew immediately!` // immediate action
        : `Your account is expiring in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`,
  };
  
}
