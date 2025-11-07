import { MP_PUBLIC_KEY } from "../const/yape";

type PaymentData = {
  monto: number,
  dni: string,
  email: string,
  token: string,
  name: string,
  lastname: string
}

export async function generateToken(phoneNumber: string, otp: string): Promise<string> {
  try {
    const response = await fetch(`https://api.mercadopago.com/platforms/pci/yape/v1/payment?public_key=${MP_PUBLIC_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        otp: otp
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al generar token');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error generando token Yape:', error);
    throw error;
  }
}

export async function createPayment(token: string, userData: PaymentData) {
  const {monto, dni, email, name, lastname} = userData

  const paymentData = {
    transaction_amount: monto, // Monto del pago
    token: token, // Token obtenido del paso anterior
    description: 'Reserva de cancha de tenis',
    payment_method_id: 'yape', // Método de pago específico
    payer: {
      email, // Email del pagador
      identification: {
        type: 'DNI', // o otro tipo según el país
        number: dni
      },
      first_name: name,
      last_name: lastname
    },
    installments: 1, // Yape generalmente es 1 cuota
    notification_url: 'https://tusitio.com/notifications' // Opcional: para webhooks
  };

  try {
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_PUBLIC_KEY}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear pago');
    }

    const paymentResult = await response.json();
    return paymentResult;
  } catch (error) {
    console.error('Error creando pago:', error);
    throw error;
  }
}