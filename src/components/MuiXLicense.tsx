import { LicenseInfo } from "@mui/x-license";
import { md5 } from "@mui/x-license/encoding";
import { useEffect } from "react";

const orderNumber = "0";
const expiryTimestamp = Date.now(); // Expiry is based on when the package was created, ignored if perpetual license
const scope = "premium"; // 'pro' or 'premium'
const licensingModel = "perpetual"; // 'perpetual', 'subscription'
const licenseInfo = `O=${orderNumber},E=${expiryTimestamp},S=${scope},LM=${licensingModel},KV=2`;

export default function MuiXLicense() {
    useEffect(() => {
        LicenseInfo.setLicenseKey(md5(btoa(licenseInfo)) + btoa(licenseInfo));
    }, []);
    return <></>;
}
