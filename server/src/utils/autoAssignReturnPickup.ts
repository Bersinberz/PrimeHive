import User from "../models/User";
import Order from "../models/Order";
import logger from "../config/logger";

const MAX_ATTEMPTS = 5;

/**
 * Assigns a delivery partner to pick up a return from the customer.
 * The partner sees it in their deliveries list with returnPickup = true.
 */
export const autoAssignReturnPickup = async (orderId: string): Promise<void> => {
  try {
    const order = await Order.findById(orderId).populate("customer", "name email");
    if (!order) return;

    const rejectedIds: string[] = [];

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const partners = await User.find({
        role: "delivery_partner",
        status: "active",
        isOnline: true,
        _id: { $nin: rejectedIds },
      }).select("_id name email phone").lean();

      if (partners.length === 0) {
        logger.info(`autoAssignReturnPickup: no online partners for order ${order.orderId} (attempt ${attempt + 1})`);
        break;
      }

      const partner = partners[Math.floor(Math.random() * partners.length)];

      // Mark order with return pickup assignment
      order.returnDeliveryPartnerId = partner._id as any;
      order.returnPickupStatus      = "assigned";
      order.returnAssignedAt        = new Date();
      await order.save();

      logger.info(`autoAssignReturnPickup: order ${order.orderId} return assigned to ${partner.name}`);
      return;
    }

    logger.warn(`autoAssignReturnPickup: could not assign return pickup for order ${order.orderId}`);
  } catch (err) {
    logger.error("autoAssignReturnPickup error:", err);
  }
};
