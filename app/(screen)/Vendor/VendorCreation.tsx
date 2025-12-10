import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import BASE_URL from "../../../config";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

const {width}=Dimensions.get('window')
type VendorRequestBody = {
  bank: {
    account_holder: string;
    account_number: string;
    ifsc: string;
  };
  dashboard_access: boolean;
  kyc_details: {
    pan: string;
  };
  userId: string;
  verify_account: boolean;
};

type ErrorState = {
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  pan?: string;
};


export default function VendorCreation() {
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [pan, setPan] = useState("");
const [remarks, setRemarks] = useState("");

  const [errors, setErrors] = useState<ErrorState>({});
  const [loading, setLoading] = useState(false);
  const userData = useSelector((state: RootState) => state.userData);
  const userId = userData?.userId || '';
  const token = userData?.accessToken;

useEffect(() => {
  getVendorId();
},[])
const getVendorId =async() =>{
  const response = await fetch(`${BASE_URL}ai-service/vendorDetails?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();
      // handle API result...
      if(!response.ok){
        throw new Error(data.message || 'Failed to create vendor');
      }
      else{
        console.log("Vendor creation response:", data);
        if(data.vendorId!=null || data.vendorId!=""){
           const getVendorStatusresponse = await fetch(`${BASE_URL}ai-service/getVendorStatus?vendorId=${data.vendorId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
      });
       const vendorStatusData = await getVendorStatusresponse.json();
       console.log("Vendor Status response:", vendorStatusData);
        if(getVendorStatusresponse.ok){
          if(vendorStatusData.status!="BANK_VALIDATION_FAILED"){
          setAccountHolder(vendorStatusData?.bank?.account_holder || '');
          setAccountNumber(vendorStatusData?.bank?.account_number || '');
          setIfsc(vendorStatusData?.bank?.ifsc || '');
          // setPan(vendorStatusData?.related_docs[1]?.doc_value || '');
           const panDoc = vendorStatusData?.related_docs?.find(
                (doc: any) => doc.doc_name === "PAN"
              );

              setPan(panDoc?.doc_value || "");
        }
        else{
          setRemarks(vendorStatusData?.remarks || "");
        }
      }

        }
       
      }
}




  const validateFields = () => {
    let valid = true;
    const newErrors: ErrorState = {};

    // Account Holder
    if (!accountHolder.trim()) {
      newErrors.accountHolder = "Account holder name is required";
      valid = false;
    }

    // Account Number: 8–20 digits
    if (!/^[0-9]{8,20}$/.test(accountNumber)) {
      newErrors.accountNumber = "Enter a valid account number (8–20 digits)";
      valid = false;
    }

//   if (!ifsc.trim()) {
//   newErrors.ifsc = "IFSC code is required";
//   valid = false;
// }

//     // IFSC: 4 letters + 0 + 6 alphanumeric
//     const ifscValue = ifsc.toUpperCase();
//     if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscValue)) {
//       newErrors.ifsc = "Enter valid IFSC (e.g., YESB0000262)";
//       valid = false;
//     }


if (!ifsc.trim()) {
  newErrors.ifsc = "IFSC code is required";
  valid = false;
} else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase())) {
  newErrors.ifsc = "Enter valid IFSC (e.g., YESB0000262)";
  valid = false;
}


    // PAN: 5 letters + 4 digits + 1 letter
  if (!pan.trim()) {
  newErrors.pan = "PAN number is required";
  valid = false;
} else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase())) {
  newErrors.pan = "Enter valid PAN (e.g., ABCPV1234D)";
  valid = false;
}


    setErrors(newErrors);
    return valid;
  };

  const buildRequestBody = (): VendorRequestBody => {
    return {
      bank: {
        account_holder: accountHolder.trim(),
        account_number: accountNumber.trim(),
        ifsc: ifsc.toUpperCase().trim(),
      },
      dashboard_access: true,
      kyc_details: {
        pan: pan.toUpperCase().trim(),
      },
      userId: userId,
      verify_account: true,
    };
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const body = buildRequestBody();
    setLoading(true);
console.log({userId})
    try {
      // Example: call your API here
         console.log("Vendor request body:", body);

      const response = await fetch(`${BASE_URL}ai-service/createVendor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`

        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      // handle API result...
      if(!response.ok){
        throw new Error(data.message || 'Failed to create vendor');
      }
      else{
console.log("Vendor creation response:", data);
      Alert.alert("Success", "Vendor KYC details captured.");
      getVendorId();
      }
     

    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while creating vendor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Text style={styles.heading}>Vendor Creation</Text> */}

      {/* Account Holder */}
      <Text style={styles.label}>Account Holder Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Account Holder Name"
        value={accountHolder}
        onChangeText={setAccountHolder}
        autoCapitalize="words"
      />
      {errors.accountHolder ? (
        <Text style={styles.error}>{errors.accountHolder}</Text>
      ) : null}

      {/* Account Number */}
      <Text style={styles.label}>Account Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Account Number"
        keyboardType="numeric"
        value={accountNumber}
        onChangeText={setAccountNumber}
      />
      {errors.accountNumber ? (
        <Text style={styles.error}>{errors.accountNumber}</Text>
      ) : null}

      {/* IFSC */}
      <Text style={styles.label}>IFSC Code</Text>
      <TextInput
        style={styles.input}
        placeholder="IFSC Code"
        value={ifsc}
        onChangeText={text => setIfsc(text.toUpperCase())}
        autoCapitalize="characters"
      />
      {errors.ifsc ? <Text style={styles.error}>{errors.ifsc}</Text> : null}

      {/* PAN */}
      <Text style={styles.label}>PAN Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Pan Number"
        value={pan}
        onChangeText={text => setPan(text.toUpperCase())}
        autoCapitalize="characters"
        maxLength={10}
      />
      {errors.pan ? <Text style={styles.error}>{errors.pan}</Text> : null}

{remarks ? (
  <Text style={{ color: "red", marginTop: 10,alignSelf:"center",width:width*0.8,textAlign:"center" }}>
    {remarks}
  </Text>
) : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Submitting..." : "Create Vendor"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#F5F7FB",
    flexGrow: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#222",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#C5C9D6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
  },
  error: {
    color: "#D32F2F",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#5856D6",
    paddingVertical: 14,
    marginTop: 30,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
