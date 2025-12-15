// Simple implementation of Thai Baht text conversion
export const thaiBahtText = (amount: number): string => {
  if (amount === 0) return "ศูนย์บาทถ้วน";

  const suffix = "บาทถ้วน";
  const strAmount = amount.toFixed(2);
  const [baht, satang] = strAmount.split(".");

  const numToText = (numStr: string): string => {
    const txtNum = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
    const txtPos = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

    let output = "";
    const len = numStr.length;

    for (let i = 0; i < len; i++) {
      const digit = parseInt(numStr.charAt(i));
      const pos = len - i - 1;

      if (digit !== 0) {
        if (pos === 0 && digit === 1 && len > 1) {
          output += "เอ็ด";
        } else if (pos === 1 && digit === 2) {
          output += "ยี่";
        } else if (pos === 1 && digit === 1) {
          // nothing (e.g. สิบ)
        } else {
          output += txtNum[digit];
        }

        output += txtPos[pos];
      }
    }
    return output;
  };

  let result = numToText(baht);

  if (parseInt(satang) > 0) {
     // Handle Satang
     result += "บาท";
     if (satang.startsWith("0")) {
       result += numToText(satang.charAt(1)) + "สตางค์";
     } else {
       // Logic for satang like 50, 25
       // Reuse the logic but slightly manual for simplicity as max is 99
       const sInt = parseInt(satang);
       const sText = numToText(sInt.toString());
       result += sText + "สตางค์";
     }
     // If satang exists, remove "ถ้วน"
     return result.replace("หนึ่งสตางค์", "หนึ่งสตางค์"); // Edge case fix if needed, but standard logic holds
  } else {
    result += suffix;
  }

  return result;
};