import { API_ENDPOINTS } from "../const/const";

/* ===========================
    CREATE SUPPORT TICKET
=========================== */
export const createSupportTicket = async (token, ticketData) => {
  try {
    const res = await fetch(API_ENDPOINTS.SUPPORT.CREATE_TICKET, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create ticket");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/* ===========================
    SEND MESSAGE (CHAT)
=========================== */
export const sendSupportMessage = async (token, messageData) => {
  try {
    const res = await fetch(API_ENDPOINTS.SUPPORT.SEND_MESSAGE, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to send message");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/* ===========================
    GET USER TICKETS
=========================== */
export const getSupportTickets = async (token) => {
  try {
    const res = await fetch(API_ENDPOINTS.SUPPORT.GET_TICKETS, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch tickets");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/* ===========================
    GET TICKET MESSAGES
=========================== */
export const getSupportMessages = async (token, ticketId) => {
  try {
    const res = await fetch(
      API_ENDPOINTS.SUPPORT.GET_MESSAGES(ticketId),
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch messages");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/* ===========================
    CLOSE TICKET
=========================== */
export const closeSupportTicket = async (token, ticketId) => {
  try {
    const res = await fetch(
      API_ENDPOINTS.SUPPORT.CLOSE_TICKET(ticketId),
      {
        method: "PATCH",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to close ticket");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};