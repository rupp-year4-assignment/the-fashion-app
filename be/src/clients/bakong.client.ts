const {
  BakongKHQR,
  khqrData,
  IndividualInfo,
  MerchantInfo,
} = require("bakong-khqr");
class BakongClient {
  private khqr = new BakongKHQR();

  generateMerchantKHQR(data: {
    amount: number;
    currency: "USD" | "KHR";
    billNumber: string;
    expiresAt?: Date;
  }) {
    try {
      const optionalData = {
        currency:
          data.currency === "USD"
            ? khqrData.currency.usd
            : khqrData.currency.khr,
        storeLabel: "Fashion Store",
        terminalLabel: "WEB",
        purposeOfTransaction: "Product Purchase",
        billNumber: data.billNumber,
      };

      const merchantInfo = new MerchantInfo(
        "rin_sanom@bkrt",
        "The Fashion App",
        "Phnom Penh",
        "123456",
        "Dev Bank",
        optionalData
      );

      const result = this.khqr.generateMerchant(merchantInfo);

      if (!result || !result.data) {
        console.error("KHQR Generation Failed:", result);
        throw new Error(result.status?.message || "Unknown KHQR error");
      }

      console.log("KHQR generated successfully (STATIC - no amount)");
      return {
        qr: result.data.qr,
        md5: result.data.md5,
      };
    } catch (error: any) {
      console.error("Error generating KHQR:", error);
      throw new Error(`Failed to generate KHQR: ${error.message}`);
    }
  }

  verifyKHQR(khqrString: string): { isValid: boolean; message?: string } {
    try {
      const verificationResult = BakongKHQR.verify(khqrString);

      if (
        !verificationResult ||
        typeof verificationResult.isValid !== "boolean"
      ) {
        return {
          isValid: false,
          message: "Invalid verification result from Bakong SDK",
        };
      }

      console.log("KHQR verification result:", verificationResult.isValid);

      return {
        isValid: verificationResult.isValid,
        message: verificationResult.isValid
          ? "KHQR is valid"
          : "KHQR is invalid",
      };
    } catch (error: any) {
      console.error("Error verifying KHQR:", error);
      return {
        isValid: false,
        message: `Failed to verify KHQR: ${error.message}`,
      };
    }
  }

  decodeKHQR(khqrString: string) {
    try {
      const decodeResult = BakongKHQR.decode(khqrString);

      if (!decodeResult || decodeResult.status.code !== 0) {
        throw new Error(
          decodeResult?.status?.message || "Failed to decode KHQR"
        );
      }

      console.log("KHQR decoded successfully");
      return decodeResult.data;
    } catch (error: any) {
      console.error("Error decoding KHQR:", error);
      throw new Error(`Failed to decode KHQR: ${error.message}`);
    }
  }
}

export default new BakongClient();
