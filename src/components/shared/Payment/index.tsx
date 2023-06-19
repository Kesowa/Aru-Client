import { message } from "antd";
import apis from "../../../services/apis";
import http from "../../../services/httpCall";

const Payment = (props: any) => {
  const pay = async () => {
    const response = await http.post(`${apis.GENERATE_ORDER}`, {
      package: "608e7a7ee11f711a34fb0474",
    });

    console.log(response);

    const options = {
      key: response.data.data.paymentId,
      amount: response.data.data.order.amount.toString(),
      currency: response.data.data.order.currency,
      name: "Kesowa",
      description: "Subscribe to the given package",
      order_id: response.data.data.order.razorpay_order_id,
      handler: async function (response) {
        const res = await http.post(`${apis.SAVE_ORDER}`, response);
        console.log(response);
        message.info(res.data.message);
      },
      prefill: {
        name: "Tenant Name",
        email: "test@kesowa.com",
        contact: "999999999",
      },
      notes: {
        address: "Kesowa, salt lake, West Bengal, India",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp1 = new (window as any).Razorpay(options);

    rzp1.open();

    rzp1.on("payment.failed", async function (response) {
      console.log(response);
      await http.post(`${apis.PAYMENT_FAILED}`, response.error.metadata);
    });
  };

  return (
    <>
      <button onClick={() => pay()}>Pay</button>
    </>
  );
};

export default Payment;
